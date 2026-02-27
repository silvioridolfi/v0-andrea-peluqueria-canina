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
    const result = await insertAppointment(
      formData.mascota_id,
      formData.fecha,
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
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : JSON.stringify(error)
    console.error('[v0] Error in crearTurno:', errorMessage)
    return {
      success: false,
      error: errorMessage
    }
  }
}
