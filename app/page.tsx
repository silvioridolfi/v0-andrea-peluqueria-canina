import Header from '@/components/header'
import BottomNavigation from '@/components/bottom-navigation'
import FABButton from '@/components/fab-button'
import AppointmentCard from '@/components/appointment-card'
import { getTodayAppointments } from '@/lib/mock-data'

export const metadata = {
  title: 'Andrea | Peluquería Canina - Turnos de Hoy',
  description: 'Gestión de turnos para peluquería canina'
}

export default async function Home() {
  const appointments = await getTodayAppointments()

  const handleAddAppointment = () => {
    // TODO: Implement add appointment flow
    console.log('Add appointment clicked')
  }

  const handleCompleteAppointment = (id: string) => {
    // TODO: Implement complete appointment flow
    console.log('Complete appointment:', id)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      {/* Main content area */}
      <main className="max-w-md mx-auto pt-24 pb-24">
        <div className="px-4 space-y-3">
          {appointments.length === 0 ? (
            <div className="flex items-center justify-center min-h-96">
              <p className="text-slate-400 text-center text-lg">
                No hay turnos agendados para hoy
              </p>
            </div>
          ) : (
            <>
              <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wide px-1">
                Turnos de Hoy
              </h2>
              {appointments.map(appointment => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  onComplete={handleCompleteAppointment}
                />
              ))}
            </>
          )}
        </div>
      </main>

      <BottomNavigation activeTab="hoy" />
      <FABButton onClick={handleAddAppointment} />
    </div>
  )
}
