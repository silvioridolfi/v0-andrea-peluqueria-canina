'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Appointment } from '@/lib/db'

interface AppointmentCardProps {
  appointment: Appointment
  onCheckout?: (appointment: Appointment) => void
}

export default function AppointmentCard({ appointment, onCheckout }: AppointmentCardProps) {
  const isCompleted = appointment.estado === 'finalizado'

  return (
    <Card className="bg-card border-border overflow-hidden">
      <div className="p-4 space-y-3">
        {/* Time - Large and prominent */}
        <div className="flex items-start justify-between">
          <div className="text-3xl font-heading font-bold text-primary">
            {appointment.hora_inicio}
          </div>
          {isCompleted && (
            <Badge className="bg-accent text-accent-foreground">
              Finalizado
            </Badge>
          )}
        </div>

        {/* Pet name - Large and bold */}
        <div>
          <h3 className="text-xl font-heading font-semibold text-foreground">
            {appointment.mascota_nombre}
          </h3>
        </div>

        {/* Race and service - Secondary text */}
        <div className="space-y-1">
          <p className="text-sm text-foreground/70">
            <span className="font-medium">{appointment.mascota_raza}</span>
          </p>
          <p className="text-sm text-foreground/60">
            {appointment.servicio}
          </p>
        </div>

        {/* Action button or completed info */}
        {!isCompleted ? (
          <Button
            onClick={() => onCheckout?.(appointment)}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Finalizar y Cobrar
          </Button>
        ) : (
          <div className="p-3 bg-accent/10 rounded-lg border border-accent/30">
            <p className="text-sm text-accent font-heading font-semibold">
              Cobrado: ${appointment.precio_final.toFixed(2)}
            </p>
          </div>
        )}
      </div>
    </Card>
  )
}
