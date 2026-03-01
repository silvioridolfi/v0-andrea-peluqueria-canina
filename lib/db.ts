import { neon } from '@neondatabase/serverless'

let sql: any = null

function getSql() {
  if (!sql) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not configured. Please set the environment variable.')
    }
    sql = neon(process.env.DATABASE_URL)
  }
  return sql
}

// Get today's date in Buenos Aires timezone (America/Argentina/Buenos_Aires)
export function getTodayDateString(): string {
  const formatter = new Intl.DateTimeFormat('es-AR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'America/Argentina/Buenos_Aires'
  })
  
  const parts = formatter.formatToParts(new Date())
  const year = parts.find(p => p.type === 'year')?.value
  const month = parts.find(p => p.type === 'month')?.value
  const day = parts.find(p => p.type === 'day')?.value
  
  return `${year}-${month}-${day}`
}

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

export interface PetDetail extends Pet {
  tamaño?: string
  sexo?: string
  notas?: string
  cliente_id?: string
  cliente_nombre?: string
  cliente_telefono?: string
}

export async function getTodayAppointments(): Promise<Appointment[]> {
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not configured')
    }

    const today = getTodayDateString()
    console.log('[v0] getTodayAppointments: Today in Buenos Aires =', today)

    const result = await getSql()`
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

    const result = await getSql()`
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
    const overlapping = await getSql()`
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
    const insertResult = await getSql()`
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
    const updateResult = await getSql()`
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
    const movimientoResult = await getSql()`
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

export async function getAppointmentsByDate(fecha: string): Promise<Appointment[]> {
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not configured')
    }

    const result = await getSql()`
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
      WHERE DATE(t.fecha) = ${fecha}
      ORDER BY t.hora_inicio ASC
    `

    return result as Appointment[]
  } catch (error) {
    console.error('[v0] Error fetching appointments by date:', error)
    return []
  }
}

export async function getAppointmentsByMonth(year: number, month: number): Promise<{ [key: string]: number }> {
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not configured')
    }

    // Get the first and last day of the month
    const firstDay = new Date(year, month - 1, 1).toISOString().split('T')[0]
    const lastDay = new Date(year, month, 0).toISOString().split('T')[0]

    const result = await getSql()`
      SELECT DATE(t.fecha) as fecha, COUNT(*) as count
      FROM turnos t
      WHERE DATE(t.fecha) BETWEEN ${firstDay} AND ${lastDay}
      GROUP BY DATE(t.fecha)
    `

    // Transform into a simple object: { "2025-02-15": 2, "2025-02-16": 1 }
    const appointmentsByDate: { [key: string]: number } = {}
    result.forEach((row: any) => {
      appointmentsByDate[row.fecha] = row.count
    })

    return appointmentsByDate
  } catch (error) {
    console.error('[v0] Error fetching appointments by month:', error)
    return {}
  }
}

export async function getDiasConTurnos(year: number, month: number): Promise<Date[]> {
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not configured')
    }

    // Get the first and last day of the month
    const firstDay = new Date(year, month - 1, 1).toISOString().split('T')[0]
    const lastDay = new Date(year, month, 0).toISOString().split('T')[0]

    console.log('[v0] getDiasConTurnos: Fetching days with appointments for', year, month)

    const result = await getSql()`
      SELECT DISTINCT DATE(t.fecha) as fecha
      FROM turnos t
      WHERE DATE(t.fecha) BETWEEN ${firstDay} AND ${lastDay}
      ORDER BY DATE(t.fecha) ASC
    `

    // Convert to array of Date objects
    const diasConTurnos: Date[] = result.map((row: any) => {
      return new Date(row.fecha + 'T00:00:00Z')
    })

    console.log('[v0] getDiasConTurnos: Found', diasConTurnos.length, 'days with appointments')
    return diasConTurnos
  } catch (error) {
    console.error('[v0] Error fetching days with appointments:', error)
    return []
  }
}

export async function getPetsWithClients(searchTerm?: string): Promise<(Pet & { cliente_nombre?: string; cliente_telefono?: string })[]> {
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not configured')
    }

    let result
    if (searchTerm) {
      const searchPattern = `%${searchTerm.toLowerCase()}%`
      result = await getSql()`
        SELECT 
          m.id,
          m.nombre,
          m.raza,
          m.tipo_animal,
          c.nombre as cliente_nombre,
          c.telefono as cliente_telefono
        FROM mascotas m
        LEFT JOIN clientes c ON m.cliente_id = c.id
        WHERE LOWER(m.nombre) LIKE ${searchPattern}
           OR LOWER(m.raza) LIKE ${searchPattern}
           OR LOWER(c.nombre) LIKE ${searchPattern}
        ORDER BY m.nombre ASC
      `
    } else {
      result = await getSql()`
        SELECT 
          m.id,
          m.nombre,
          m.raza,
          m.tipo_animal,
          c.nombre as cliente_nombre,
          c.telefono as cliente_telefono
        FROM mascotas m
        LEFT JOIN clientes c ON m.cliente_id = c.id
        ORDER BY m.nombre ASC
      `
    }

    return result
  } catch (error) {
    console.error('[v0] Error fetching pets with clients:', error)
    return []
  }
}

export async function getPetDetail(petId: string): Promise<PetDetail | null> {
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not configured')
    }

    const result = await getSql()`
      SELECT 
        m.id,
        m.nombre,
        m.raza,
        m.tipo_animal,
        m.tamaño,
        m.sexo,
        m.notas,
        m.cliente_id,
        c.nombre as cliente_nombre,
        c.telefono as cliente_telefono
      FROM mascotas m
      LEFT JOIN clientes c ON m.cliente_id = c.id
      WHERE m.id = ${petId}
    `

    return result.length > 0 ? result[0] : null
  } catch (error) {
    console.error('[v0] Error fetching pet detail:', error)
    return null
  }
}

export async function getPetAppointmentHistory(petId: string, limit: number = 5): Promise<Appointment[]> {
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not configured')
    }

    const result = await getSql()`
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
      WHERE t.mascota_id = ${petId} AND t.estado = 'finalizado'
      ORDER BY t.fecha DESC, t.hora_inicio DESC
      LIMIT ${limit}
    `

    return result as Appointment[]
  } catch (error) {
    console.error('[v0] Error fetching pet appointment history:', error)
    return []
  }
}

export async function crearMascotaConClienteDb(data: {
  mascota_nombre: string
  mascota_raza: string
  mascota_tamaño?: string
  mascota_sexo?: string
  mascota_notas?: string
  cliente_nombre: string
  cliente_telefono: string
}): Promise<{ success: boolean; error?: string; mascota_id?: string }> {
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not configured')
    }

    // Validate required fields
    if (!data.mascota_nombre || !data.cliente_nombre || !data.cliente_telefono) {
      return {
        success: false,
        error: 'Los campos de nombre de mascota, dueño y teléfono son requeridos'
      }
    }

    // First, insert the cliente
    console.log('[v0] Insertando cliente:', data.cliente_nombre, data.cliente_telefono)
    const clienteResult = await getSql()`
      INSERT INTO clientes (nombre, telefono)
      VALUES (${data.cliente_nombre}, ${data.cliente_telefono})
      RETURNING id
    `

    if (!clienteResult || clienteResult.length === 0) {
      return {
        success: false,
        error: 'Error al crear el cliente'
      }
    }

    const clienteId = clienteResult[0].id
    console.log('[v0] Cliente creado con ID:', clienteId)

    // Then, insert the mascota with the cliente_id
    console.log('[v0] Insertando mascota para cliente:', clienteId)
    const mascotaResult = await getSql()`
      INSERT INTO mascotas (nombre, raza, tipo_animal, tamaño, sexo, notas, cliente_id)
      VALUES (${data.mascota_nombre}, ${data.mascota_raza}, 'perro', ${data.mascota_tamaño || null}, ${data.mascota_sexo || null}, ${data.mascota_notas || null}, ${clienteId})
      RETURNING id
    `

    if (!mascotaResult || mascotaResult.length === 0) {
      return {
        success: false,
        error: 'Error al crear la mascota'
      }
    }

    const mascotaId = mascotaResult[0].id
    console.log('[v0] Mascota creada con ID:', mascotaId)

    return { success: true, mascota_id: mascotaId }
  } catch (error: any) {
    const errorMsg = error?.message || String(error)
    console.error('[v0] Error creando mascota con cliente:', errorMsg)
    return {
      success: false,
      error: errorMsg
    }
  }
}
