import Header from '@/components/header'
import BottomNavigation from '@/components/bottom-navigation'
import ClientLayout from '@/components/client-layout'
import AppointmentCard from '@/components/appointment-card'
import { getTodayAppointments, getAllPets } from '@/lib/db'
import { CalendarX, AlertCircle } from 'lucide-react'

export const metadata = {
  title: 'Andrea | Peluquería Canina - Turnos de Hoy',
  description: 'Gestión de turnos para peluquería canina'
}

async function AppointmentsList() {
  try {
    if (!process.env.DATABASE_URL) {
      return (
        <div className="flex flex-col items-center justify-center min-h-96 gap-4">
          <AlertCircle className="w-12 h-12 text-red-500" />
          <div className="text-center">
            <p className="text-red-600 font-semibold">Error de Configuración</p>
            <p className="text-sm text-slate-500 mt-2">
              DATABASE_URL no está configurado. Por favor, agrega la variable de entorno en los settings de v0.
            </p>
          </div>
        </div>
      )
    }

    const appointments = await getTodayAppointments()

    if (appointments.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center min-h-96 gap-4">
          <CalendarX className="w-12 h-12 text-slate-300" />
          <p className="text-slate-400 text-center text-lg">
            No hay turnos agendados para hoy
          </p>
        </div>
      )
    }

    return (
      <>
        <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wide px-1">
          Turnos de Hoy
        </h2>
        <div className="space-y-3">
          {appointments.map(appointment => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
            />
          ))}
        </div>
      </>
    )
  } catch (error) {
    console.error('Error loading appointments:', error)
    return (
      <div className="flex flex-col items-center justify-center min-h-96 gap-4">
        <AlertCircle className="w-12 h-12 text-amber-600" />
        <div className="text-center">
          <p className="text-amber-600 font-semibold">Error al cargar turnos</p>
          <p className="text-sm text-slate-500 mt-2">
            Verifica que DATABASE_URL esté configurado correctamente.
          </p>
        </div>
      </div>
    )
  }
}

export default async function Home() {
  let pets = []

  try {
    pets = await getAllPets()
  } catch (error) {
    console.error('Error fetching pets:', error)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      {/* Main content area */}
      <main className="max-w-md mx-auto pt-24 pb-24">
        <div className="px-4 space-y-3">
          <AppointmentsList />
        </div>
      </main>

      <BottomNavigation activeTab="hoy" />
      <ClientLayout pets={pets} />
    </div>
  )
}
