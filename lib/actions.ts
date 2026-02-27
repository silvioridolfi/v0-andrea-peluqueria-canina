'use server'

import { revalidatePath } from 'next/cache'
import { insertAppointment, finalizarTurnoDb } from '@/lib/db'

export async function crearTurno(formData: {
  mascota_id: string  // UUID string
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

export async function finalizarTurno(turnoId: number, precio: number) {
  try {
    console.log('[v0] finalizarTurno: Recibido turnoId:', turnoId, 'precio:', precio)

    if (!turnoId || isNaN(turnoId) || !precio || isNaN(precio) || precio <= 0) {
      return {
        success: false,
        error: 'Datos inválidos para finalizar turno'
      }
    }

    const result = await finalizarTurnoDb(turnoId, precio)

    if (!result.success) {
      console.log('[v0] finalizarTurno: Error:', result.error)
      return result
    }

    // Revalidate the page to refresh the appointments list
    console.log('[v0] finalizarTurno: Llamando revalidatePath')
    revalidatePath('/')

    console.log('[v0] finalizarTurno: Éxito')
    return { success: true }
  } catch (error: any) {
    const errorMsg = error?.message || String(error)
    console.error('[v0] finalizarTurno ERROR:', errorMsg)
    return {
      success: false,
      error: errorMsg
    }
  }
}
