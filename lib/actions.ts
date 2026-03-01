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

export async function finalizarTurno(turnoId: number, precio: string | number) {
  try {
    console.log('[v0] finalizarTurno: Recibido turnoId:', turnoId, 'precio (raw):', precio)

    // Convert precio to number if it's a string
    const precioNum = typeof precio === 'string' ? parseFloat(precio) : precio
    console.log('[v0] finalizarTurno: precio convertido a:', precioNum, 'tipo:', typeof precioNum)

    // Validate inputs
    if (!turnoId || isNaN(turnoId) || turnoId <= 0) {
      return {
        success: false,
        error: 'ID de turno inválido'
      }
    }

    if (!precioNum || isNaN(precioNum) || precioNum <= 0) {
      return {
        success: false,
        error: 'Por favor ingresa un precio válido mayor a 0'
      }
    }

    console.log('[v0] finalizarTurno: Validaciones pasadas, llamando finalizarTurnoDb')

    const result = await finalizarTurnoDb(turnoId, precioNum)

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

export async function updateMascotaCliente(
  petId: string,
  clienteId: string | undefined,
  data: {
    notas?: string
    telefono?: string
  }
) {
  try {
    console.log('[v0] updateMascotaCliente: petId=', petId, 'data=', data)

    if (!petId || typeof petId !== 'string') {
      return {
        success: false,
        error: 'ID de mascota inválido'
      }
    }

    const { neon } = require('@neondatabase/serverless')
    const sql = neon(process.env.DATABASE_URL)

    // Update mascota notas if provided
    if (data.notas !== undefined) {
      console.log('[v0] Actualizando notas de mascota:', data.notas)
      await sql`
        UPDATE mascotas
        SET notas = ${data.notas}
        WHERE id = ${petId}
      `
    }

    revalidatePath('/')
    console.log('[v0] updateMascotaCliente: Éxito')
    
    return { success: true }
  } catch (error: any) {
    const errorMsg = error?.message || String(error)
    console.error('[v0] updateMascotaCliente ERROR:', errorMsg)
    return {
      success: false,
      error: errorMsg
    }
  }
}
