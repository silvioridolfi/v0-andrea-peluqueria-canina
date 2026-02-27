'use client'

import { useState } from 'react'
import AppointmentCard from '@/components/appointment-card'
import CheckoutDrawer from '@/components/checkout-drawer'
import { Appointment } from '@/lib/db'

interface AppointmentsListClientProps {
  appointments: Appointment[]
}

export default function AppointmentsListClient({ appointments }: AppointmentsListClientProps) {
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)

  const handleCheckout = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setCheckoutOpen(true)
  }

  return (
    <>
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide px-1">
        Turnos de Hoy
      </h2>
      <div className="space-y-3">
        {appointments.map(appointment => (
          <AppointmentCard
            key={appointment.id}
            appointment={appointment}
            onCheckout={handleCheckout}
          />
        ))}
      </div>

      <CheckoutDrawer
        isOpen={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        appointment={selectedAppointment}
      />
    </>
  )
}
