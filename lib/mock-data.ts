export interface Appointment {
  id: string
  mascota_nombre: string
  mascota_raza: string
  servicio: string
  hora_inicio: string
  estado: 'agendado' | 'confirmado' | 'finalizado'
}

// Simulates database query for today's appointments
// In future, replace with actual database call
export async function getTodayAppointments(): Promise<Appointment[]> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300))

  return [
    {
      id: '1',
      mascota_nombre: 'Luna',
      mascota_raza: 'Golden Retriever',
      servicio: 'Baño y corte',
      hora_inicio: '09:00',
      estado: 'confirmado'
    },
    {
      id: '2',
      mascota_nombre: 'Max',
      mascota_raza: 'Bulldog Francés',
      servicio: 'Baño',
      hora_inicio: '10:30',
      estado: 'agendado'
    },
    {
      id: '3',
      mascota_nombre: 'Bella',
      mascota_raza: 'Poodle',
      servicio: 'Corte y peinado',
      hora_inicio: '12:00',
      estado: 'finalizado'
    },
    {
      id: '4',
      mascota_nombre: 'Rocky',
      mascota_raza: 'Pastor Alemán',
      servicio: 'Baño, corte y uñas',
      hora_inicio: '14:30',
      estado: 'confirmado'
    },
    {
      id: '5',
      mascota_nombre: 'Daisy',
      mascota_raza: 'Cocker Spaniel',
      servicio: 'Baño y corte',
      hora_inicio: '16:00',
      estado: 'agendado'
    }
  ]
}
