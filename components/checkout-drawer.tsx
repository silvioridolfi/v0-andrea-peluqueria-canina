'use client'

import { useState } from 'react'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { finalizarTurno } from '@/lib/actions'
import { Appointment } from '@/lib/db'

interface CheckoutDrawerProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  appointment: Appointment | null
}

export default function CheckoutDrawer({
  isOpen,
  onOpenChange,
  appointment,
}: CheckoutDrawerProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [precio, setPrecio] = useState('')
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!appointment) {
      toast({
        title: 'Error',
        description: 'No hay turno seleccionado',
        variant: 'destructive',
      })
      return
    }

    const precioNum = parseFloat(precio)
    if (!precio || isNaN(precioNum) || precioNum <= 0) {
      toast({
        title: 'Error',
        description: 'Por favor ingresa un precio válido',
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)
    try {
      console.log('[v0] Finalizando turno:', appointment.id, 'con precio:', precioNum)

      const result = await finalizarTurno(appointment.id, precioNum)

      console.log('[v0] Respuesta finalizarTurno:', result)

      if (result.success) {
        toast({
          title: 'Éxito',
          description: `Turno finalizado - Cobrado: $${precioNum.toFixed(2)}`,
        })
        onOpenChange(false)
        setPrecio('')
      } else {
        const errorMsg = result.error ? String(result.error) : 'Error al finalizar turno'
        toast({
          title: 'Error',
          description: errorMsg,
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('[v0] Error en handleSubmit:', error)
      const errorMsg = error instanceof Error ? error.message : 'Error al finalizar turno'
      toast({
        title: 'Error',
        description: errorMsg,
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent className="bg-background border-border">
        <DrawerHeader>
          <DrawerTitle className="font-heading">Finalizar y Cobrar</DrawerTitle>
          <DrawerDescription>
            Completa los detalles del cobro
          </DrawerDescription>
        </DrawerHeader>

        {appointment && (
          <form onSubmit={handleSubmit} className="px-4 pb-6 space-y-4">
            {/* Appointment Details */}
            <div className="space-y-2 p-3 bg-secondary rounded-lg">
              <p className="text-sm text-muted-foreground">Mascota</p>
              <p className="text-lg font-heading font-semibold text-foreground">
                {appointment.mascota_nombre}
              </p>
              <p className="text-sm text-foreground/70">
                {appointment.mascota_raza}
              </p>

              <div className="pt-2 border-t border-border">
                <p className="text-sm text-muted-foreground">Servicio</p>
                <p className="text-base font-medium text-foreground">
                  {appointment.servicio}
                </p>
              </div>
            </div>

            {/* Price Input */}
            <div className="space-y-2">
              <Label htmlFor="precio" className="font-heading">
                Precio Cobrado ($)
              </Label>
              <Input
                id="precio"
                type="number"
                placeholder="0.00"
                step="0.01"
                min="0"
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
                className="text-lg h-12 font-heading"
                autoFocus
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-heading h-12 text-base"
            >
              {isLoading ? 'Guardando...' : 'Confirmar Cobro'}
            </Button>

            <DrawerClose asChild>
              <Button
                type="button"
                variant="outline"
                className="w-full font-heading"
                disabled={isLoading}
              >
                Cancelar
              </Button>
            </DrawerClose>
          </form>
        )}
      </DrawerContent>
    </Drawer>
  )
}
