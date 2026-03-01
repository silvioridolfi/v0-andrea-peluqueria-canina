import { getAppointmentsByMonth, getAppointmentsByDate, getAllPets, getDiasConTurnos, getTodayDateString } from '@/lib/db'
import AgendaClient from '@/components/agenda-client'
import BottomNavigation from '@/components/bottom-navigation'

export const metadata = {
  title: 'Andrea | Peluquería Canina - Agenda',
  description: 'Planificación de turnos para peluquería canina'
}

export default async function AgendaPage() {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth() + 1

  // Get appointments for the current month
  const appointmentsByMonth = await getAppointmentsByMonth(year, month)

  // Get days with appointments for calendar indicators
  const diasConTurnos = await getDiasConTurnos(year, month)

  // Get appointments for today using Buenos Aires timezone
  const todayStr = getTodayDateString()
  const appointmentsForToday = await getAppointmentsByDate(todayStr)

  // Get all pets
  let pets = []
  try {
    pets = await getAllPets()
  } catch (error) {
    console.error('Error fetching pets:', error)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-10 bg-background border-b border-border">
        <div className="max-w-md mx-auto px-4 py-4 text-center">
          <h1 className="text-2xl font-heading font-bold text-primary">
            Andrea <span className="text-accent">|</span> Agenda
          </h1>
        </div>
      </header>

      {/* Main content area */}
      <main className="max-w-md mx-auto pt-24 pb-24">
        <div className="px-4 space-y-3">
          <AgendaClient 
            initialAppointmentsByMonth={appointmentsByMonth}
            initialAppointmentsForToday={appointmentsForToday}
            diasConTurnos={diasConTurnos}
            pets={pets}
          />
        </div>
      </main>

      <BottomNavigation activeTab="agenda" />
    </div>
  )
}
