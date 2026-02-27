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
  id: string  // Database uses UUID, not numeric ID
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
  mascota_id: string,  // UUID string
  fecha: string,
  hora_inicio: string,
  servicio: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not configured')
    }

    // Validate mascota_id (UUID format - string)
    if (!mascota_id || typeof mascota_id !== 'string' || mascota_id.trim() === '') {
      return {
        success: false,
        error: 'ID de mascota inválido'
      }
    }

    // Validate fecha format (YYYY-MM-DD)
    if (!fecha || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
      return {
        success: false,
        error: 'Formato de fecha inválido (debe ser YYYY-MM-DD)'
      }
    }

    // Format times strictly: if hora_inicio is "10:30", calculate hora_fin properly
    const [h, m] = hora_inicio.split(':')
    const horaNum = parseInt(h, 10)
    const minNum = parseInt(m, 10)
    
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

    // Insert the appointment using Neon SQL syntax
    const insertResult = await sql`
      INSERT INTO turnos (mascota_id, fecha, hora_inicio, hora_fin, servicio, estado, precio_final)
      VALUES (${mascota_id}, ${fecha}, ${hora_inicio_formatted}, ${hora_fin}, ${servicio}, 'agendado', 0)
      RETURNING id
    `

    console.log('[v0] Inserción exitosa:', insertResult)
    return { success: true }
  } catch (error: any) {
    const errorMsg = error?.message || String(error)
    console.error('[v0] Error insertando turno:', errorMsg)
    return {
      success: false,
      error: errorMsg
    }
  }
}

export async function finalizarTurnoDb(
  turnoId: number,
  precio: number
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not configured')
    }

    console.log('[v0] finalizarTurnoDb: Actualizando turno', turnoId, 'con precio:', precio)

    // Update turno - set estado to 'finalizado' and precio_final
    const updateResult = await sql`
      UPDATE turnos
      SET estado = 'finalizado', precio_final = ${precio}
      WHERE id = ${turnoId}
      RETURNING id
    `

    if (!updateResult || updateResult.length === 0) {
      return {
        success: false,
        error: 'No se encontró el turno para actualizar'
      }
    }

    console.log('[v0] Turno actualizado:', updateResult)

    // Insert into movimientos_financieros
    const movimientoResult = await sql`
      INSERT INTO movimientos_financieros (tipo, monto, turno_id, descripcion, fecha)
      VALUES ('ingreso', ${precio}, ${turnoId}, 'Cobro de servicio', CURRENT_DATE)
      RETURNING id
    `

    console.log('[v0] Movimiento financiero registrado:', movimientoResult)

    return { success: true }
  } catch (error: any) {
    const errorMsg = error?.message || String(error)
    console.error('[v0] Error finalizando turno:', errorMsg)
    return {
      success: false,
      error: errorMsg
    }
  }
}
