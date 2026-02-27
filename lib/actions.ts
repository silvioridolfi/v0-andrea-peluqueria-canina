'use server'

import { revalidatePath } from 'next/cache'
import { insertAppointment } from '@/lib/db'

export async function crearTurno(formData: {
  mascota_id: number
  fecha: string
  hora_inicio: string
  servicio: string
}) {
  try {
    // Ensure fecha is in YYYY-MM-DD format
    const fechaStr = new Date(formData.fecha).toISOString().split('T')[0]
    
    const result = await insertAppointment(
      formData.mascota_id,
      fechaStr,
      formData.hora_inicio,
      formData.servicio
    )

    if (!result.success) {
      return {
        success: false,
        error: result.error
      }
    }

    // Revalidate the page to refresh the appointments list
    revalidatePath('/')

    return { success: true }
  } catch (error: any) {
    const errorMsg = error?.message || String(error)
    console.error('[v0] SQL ERROR in crearTurno:', errorMsg)
    return {
      success: false,
      error: errorMsg
    }
  }
}
