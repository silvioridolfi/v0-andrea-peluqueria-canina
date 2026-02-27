'use server'

import { revalidatePath } from 'next/cache'
import { insertAppointment } from '@/lib/db'

export async function crearTurno(formData: {
  mascota_id: number  // Numeric ID
  fecha: string
  hora_inicio: string
  servicio: string
}) {
  try {
    console.log('[v0] Server Action: Recibido formData:', formData)
    
    // Ensure fecha is in YYYY-MM-DD format
    const fechaStr = new Date(formData.fecha).toISOString().split('T')[0]
    console.log('[v0] Server Action: Fecha convertida a:', fechaStr)
    
    const result = await insertAppointment(
      formData.mascota_id,
      fechaStr,
      formData.hora_inicio,
      formData.servicio
    )

    console.log('[v0] Server Action: Resultado de insertAppointment:', result)

    if (!result.success) {
      console.log('[v0] Server Action: Retornando error:', result.error)
      return {
        success: false,
        error: result.error
      }
    }

    // Revalidate the page to refresh the appointments list
    console.log('[v0] Server Action: Llamando revalidatePath')
    revalidatePath('/')

    console.log('[v0] Server Action: Retornando éxito')
    return { success: true }
  } catch (error: any) {
    const errorMsg = error?.message || String(error)
    console.error('[v0] Server Action ERROR:', errorMsg)
    console.error('[v0] Server Action ERROR Stack:', error?.stack)
    return {
      success: false,
      error: errorMsg
    }
  }
}
