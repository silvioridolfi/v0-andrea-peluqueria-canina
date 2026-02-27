'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import HybridCalendar from '@/components/hybrid-calendar'
import CheckoutDrawer from '@/components/checkout-drawer'
import FABButton from '@/components/fab-button'
import BottomNavigation from '@/components/bottom-navigation'
import NewAppointmentForm from '@/components/new-appointment-form'
import { Pet, Appointment } from '@/lib/db'
import { getAppointmentsByDate } from '@/lib/db'

interface AgendaClientProps {
  initialAppointmentsByMonth: { [key: string]: number }
  initialAppointmentsForToday: Appointment[]
  diasConTurnos: Date[]
  pets: Pet[]
}

export default function AgendaClient({
  initialAppointmentsByMonth,
  initialAppointmentsForToday,
  diasConTurnos,
  pets
}: AgendaClientProps) {
  const router = useRouter()
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [appointmentsForDate, setAppointmentsForDate] = useState<Appointment[]>(initialAppointmentsForToday)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = useState(false)

  const handleDateSelect = async (date: Date) => {
    setSelectedDate(date)
    const dateStr = date.toISOString().split('T')[0]
    
    // Fetch appointments for the selected date
    const appointments = await getAppointmentsByDate(dateStr)
    setAppointmentsForDate(appointments)
  }

  const handleCheckout = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setIsCheckoutOpen(true)
  }

  const handleFABClick = () => {
    setIsNewAppointmentOpen(true)
  }

  return (
    <>
      <HybridCalendar
        appointmentsByMonth={initialAppointmentsByMonth}
        onDateSelect={handleDateSelect}
        appointmentsForDate={appointmentsForDate}
        selectedDate={selectedDate}
        onCheckout={handleCheckout}
        diasConTurnos={diasConTurnos}
      />

      {/* Checkout Drawer */}
      {selectedAppointment && (
        <CheckoutDrawer
          isOpen={isCheckoutOpen}
          onOpenChange={setIsCheckoutOpen}
          appointment={selectedAppointment}
        />
      )}

      {/* New Appointment Form */}
      <NewAppointmentForm
        pets={pets}
        isOpen={isNewAppointmentOpen}
        onOpenChange={setIsNewAppointmentOpen}
        preselectedDate={selectedDate}
      />

      {/* FAB Button */}
      <FABButton onClick={handleFABClick} />

      {/* Bottom Navigation */}
      <BottomNavigation activeTab="agenda" />
    </>
  )
}
