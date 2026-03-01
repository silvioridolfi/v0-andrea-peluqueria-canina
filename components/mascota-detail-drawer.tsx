'use client'

import { useEffect, useState } from 'react'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { getPetDetail, getPetAppointmentHistory } from '@/lib/db'
import { Phone, MessageCircle } from 'lucide-react'
import MascotaEditForm from '@/components/mascota-edit-form'

interface MascotaDetailDrawerProps {
  petId: string
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export default function MascotaDetailDrawer({
  petId,
  isOpen,
  onOpenChange
}: MascotaDetailDrawerProps) {
  const [petDetail, setPetDetail] = useState<any>(null)
  const [appointments, setAppointments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isEditOpen, setIsEditOpen] = useState(false)

  useEffect(() => {
    if (!isOpen || !petId) return

    const fetchData = async () => {
      setIsLoading(true)
      try {
        const [detail, history] = await Promise.all([
          getPetDetail(petId),
          getPetAppointmentHistory(petId, 5)
        ])
        setPetDetail(detail)
        setAppointments(history)
      } catch (error) {
        console.error('[v0] Error fetching pet detail:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [isOpen, petId])

  if (!petDetail && !isLoading) {
    return null
  }

  const handleCall = () => {
    if (petDetail?.cliente_telefono) {
      window.location.href = `tel:${petDetail.cliente_telefono}`
    }
  }

  const handleWhatsApp = () => {
    if (petDetail?.cliente_telefono) {
      const phone = petDetail.cliente_telefono.replace(/\D/g, '')
      window.open(`https://wa.me/54${phone}`, '_blank')
    }
  }

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent className="bg-background border-border">
        <DrawerHeader>
          <DrawerTitle className="font-heading text-foreground">
            {petDetail?.nombre}
          </DrawerTitle>
          <DrawerDescription>
            {petDetail?.raza} · {petDetail?.tipo_animal}
          </DrawerDescription>
        </DrawerHeader>

        {isLoading ? (
          <div className="px-4 py-8 text-center text-muted-foreground">
            Cargando...
          </div>
        ) : (
          <div className="px-4 pb-6 space-y-4 overflow-y-auto max-h-96">
            {/* Pet Details */}
            <Card className="bg-card border-border p-4 space-y-3">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Tamaño</p>
                <p className="text-sm font-medium text-foreground">
                  {petDetail?.tamaño || 'No especificado'}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Sexo</p>
                <p className="text-sm font-medium text-foreground">
                  {petDetail?.sexo || 'No especificado'}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Notas</p>
                <p className="text-sm text-foreground/80">
                  {petDetail?.notas || 'Sin notas'}
                </p>
              </div>
            </Card>

            {/* Owner Info */}
            {petDetail?.cliente_nombre && (
              <Card className="bg-card border-border p-4 space-y-3">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Dueño</p>
                <p className="text-sm font-medium text-foreground">
                  {petDetail.cliente_nombre}
                </p>

                {petDetail?.cliente_telefono && (
                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={handleCall}
                      size="sm"
                      variant="outline"
                      className="flex-1 gap-2"
                    >
                      <Phone className="w-4 h-4" />
                      Llamar
                    </Button>
                    <Button
                      onClick={handleWhatsApp}
                      size="sm"
                      variant="outline"
                      className="flex-1 gap-2"
                    >
                      <MessageCircle className="w-4 h-4" />
                      WhatsApp
                    </Button>
                  </div>
                )}
              </Card>
            )}

            {/* Appointment History */}
            {appointments.length > 0 && (
              <Card className="bg-card border-border p-4 space-y-3">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  Últimos Turnos
                </p>
                <div className="space-y-2">
                  {appointments.map((apt) => (
                    <div key={apt.id} className="flex justify-between items-start text-sm">
                      <div>
                        <p className="font-medium text-foreground">{apt.servicio}</p>
                        <p className="text-xs text-muted-foreground">
                          {apt.hora_inicio.substring(0, 5)}
                        </p>
                      </div>
                      <p className="text-xs text-accent font-medium">
                        ${apt.precio_final.toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Edit Button */}
            <Button
              onClick={() => setIsEditOpen(true)}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-heading"
            >
              Editar
            </Button>
          </div>
        )}
      </DrawerContent>

      {/* Edit Form Modal */}
      <MascotaEditForm
        petId={petId}
        petDetail={petDetail}
        isOpen={isEditOpen}
        onOpenChange={setIsEditOpen}
        onSave={() => {
          // Refresh pet detail
          const fetchData = async () => {
            const detail = await getPetDetail(petId)
            setPetDetail(detail)
          }
          fetchData()
          setIsEditOpen(false)
        }}
      />
    </Drawer>
  )
}
