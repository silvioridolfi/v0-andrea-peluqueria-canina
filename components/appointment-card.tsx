import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Appointment } from '@/lib/db'

interface AppointmentCardProps {
  appointment: Appointment
}

export default function AppointmentCard({ appointment }: AppointmentCardProps) {
  const isCompleted = appointment.estado === 'finalizado'

  return (
    <Card className="bg-white border border-slate-200 overflow-hidden">
      <div className="p-4 space-y-3">
        {/* Time - Large and prominent */}
        <div className="flex items-start justify-between">
          <div className="text-3xl font-bold text-amber-600">
            {appointment.hora_inicio}
          </div>
          {isCompleted && (
            <Badge className="bg-emerald-500 text-white">Finalizado</Badge>
          )}
        </div>

        {/* Pet name - Large and bold */}
        <div>
          <h3 className="text-xl font-bold text-slate-900">
            {appointment.mascota_nombre}
          </h3>
        </div>

        {/* Race and service - Secondary text */}
        <div className="space-y-1">
          <p className="text-sm text-slate-600">
            <span className="font-medium">{appointment.mascota_raza}</span>
          </p>
          <p className="text-sm text-slate-500">
            {appointment.servicio}
          </p>
        </div>

        {/* Action button */}
        {!isCompleted && (
          <Button
            className="w-full bg-amber-600 hover:bg-amber-700 text-white"
          >
            Finalizar y Cobrar
          </Button>
        )}
      </div>
    </Card>
  )
}
