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
