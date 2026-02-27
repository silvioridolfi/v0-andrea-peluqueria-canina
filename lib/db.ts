import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL || '')

export interface Appointment {
  id: number
  hora_inicio: string
  hora_fin: string
  mascota_nombre: string
  mascota_raza: string
  mascota_tipo: string
  servicio: string
  estado: 'pendiente' | 'finalizado'
  precio_final: number
}

export interface Pet {
  id: number
  nombre: string
  raza: string
  tipo_animal: string
}

export async function getTodayAppointments(): Promise<Appointment[]> {
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not configured')
    }

    const today = new Date().toISOString().split('T')[0]

    const result = await sql`
      SELECT 
        t.id,
        t.hora_inicio,
        t.hora_fin,
        m.nombre as mascota_nombre,
        m.raza as mascota_raza,
        m.tipo_animal as mascota_tipo,
        t.servicio,
        t.estado,
        t.precio_final
      FROM turnos t
      JOIN mascotas m ON t.mascota_id = m.id
      WHERE DATE(t.fecha) = ${today}
      ORDER BY t.hora_inicio ASC
    `

    return result as Appointment[]
  } catch (error) {
    console.error('Error fetching appointments:', error)
    throw error
  }
}

export async function getAllPets(): Promise<Pet[]> {
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not configured')
    }

    const result = await sql`
      SELECT id, nombre, raza, tipo_animal
      FROM mascotas
      ORDER BY nombre ASC
    `

    return result as Pet[]
  } catch (error) {
    console.error('Error fetching pets:', error)
    throw error
  }
}

export async function insertAppointment(
  mascota_id: number,
  fecha: string,
  hora_inicio: string,
  servicio: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not configured')
    }

    // Validate mascota_id
    if (!mascota_id || isNaN(mascota_id)) {
      return {
        success: false,
        error: 'ID de mascota inválido'
      }
    }

    // Format times strictly: if hora_inicio is "10:30", calculate hora_fin properly
    const [h, m] = hora_inicio.split(':')
    const horaNum = parseInt(h)
    const minNum = parseInt(m)
    
    if (isNaN(horaNum) || isNaN(minNum)) {
      return {
        success: false,
        error: 'Formato de hora inválido'
      }
    }

    // Calculate hora_fin: add 1 hour, handle day overflow
    const horaFinNum = (horaNum + 1) % 24
    const hora_inicio_formatted = `${String(horaNum).padStart(2, '0')}:${String(minNum).padStart(2, '0')}:00`
    const hora_fin = `${String(horaFinNum).padStart(2, '0')}:${String(minNum).padStart(2, '0')}:00`

    // Log the payload BEFORE making the query
    console.log('[v0] INTENTANDO INSERTAR:', { mascota_id, fecha, hora_inicio_formatted, hora_fin, servicio })

    // Check for overlapping appointments
    const overlapping = await sql`
      SELECT id FROM turnos
      WHERE mascota_id = ${mascota_id}
      AND DATE(fecha) = ${fecha}
      AND (
        (hora_inicio < ${hora_fin} AND hora_fin > ${hora_inicio_formatted})
      )
    `

    if (overlapping.length > 0) {
      return {
        success: false,
        error: 'Ya existe un turno superpuesto para esta mascota en ese horario'
      }
    }

    // Insert the appointment
    const insertResult = await sql`
      INSERT INTO turnos (mascota_id, fecha, hora_inicio, hora_fin, servicio, estado, precio_final)
      VALUES (${mascota_id}, ${fecha}, ${hora_inicio_formatted}, ${hora_fin}, ${servicio}, 'agendado', 0)
      RETURNING id
    `

    console.log('[v0] Inserción exitosa:', insertResult)
    return { success: true }
  } catch (error) {
    console.error('[v0] Error insertando turno:', error)
    const errorMessage = error instanceof Error ? error.message : JSON.stringify(error)
    return {
      success: false,
      error: errorMessage
    }
  }
}
