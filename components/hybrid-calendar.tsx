'use client'

import { useState, useMemo } from 'react'
import { Calendar } from '@/components/ui/calendar'
import AppointmentCard from '@/components/appointment-card'
import { Appointment } from '@/lib/db'

interface HybridCalendarProps {
  appointmentsByMonth: { [key: string]: number }
  onDateSelect: (date: Date) => void
  appointmentsForDate: Appointment[]
  selectedDate: Date
  onCheckout?: (appointment: Appointment) => void
}

export default function HybridCalendar({
  appointmentsByMonth,
  onDateSelect,
  appointmentsForDate,
  selectedDate,
  onCheckout
}: HybridCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date())

  // Create a custom day renderer that shows indicators
  const disabledDays = useMemo(() => {
    return Object.keys(appointmentsByMonth).map(dateStr => new Date(dateStr))
  }, [appointmentsByMonth])

  const formattedDate = selectedDate.toLocaleDateString('es-AR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return (
    <div className="space-y-4">
      {/* Calendar Section */}
      <div className="bg-card border border-border rounded-lg p-4">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => {
            if (date) onDateSelect(date)
          }}
          month={currentMonth}
          onMonthChange={setCurrentMonth}
          disabled={(date) => false}
          className="w-full"
        />
        
        {/* Indicator legend */}
        <div className="mt-4 text-xs text-foreground/60 text-center">
          <p>Selecciona un día para ver los turnos agendados</p>
        </div>
      </div>

      {/* Appointments Section */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide px-1">
          {formattedDate}
        </h3>

        <div className="min-h-48 max-h-96 overflow-y-auto space-y-3 pb-4">
          {appointmentsForDate.length > 0 ? (
            appointmentsForDate.map(appointment => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                onCheckout={onCheckout}
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center min-h-48 text-center">
              <p className="text-muted-foreground">Día libre</p>
              <p className="text-xs text-foreground/50 mt-2">No hay turnos agendados para esta fecha</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
