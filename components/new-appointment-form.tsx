'use client'

import { useState, useEffect } from 'react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import PetCombobox from '@/components/pet-combobox'
import { crearTurno } from '@/lib/actions'
import { Pet } from '@/lib/db'

interface NewAppointmentFormProps {
  pets?: Pet[]
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  preselectedDate?: Date
}

export default function NewAppointmentForm({ 
  pets = [], 
  isOpen,
  onOpenChange,
  preselectedDate
}: NewAppointmentFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    mascota_id: '',
    fecha: preselectedDate ? preselectedDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    hora_inicio: '10:00',
    servicio: 'Corte',
  })
  const { toast } = useToast()

  // Update fecha when preselectedDate changes
  useEffect(() => {
    if (preselectedDate) {
      setFormData(prev => ({
        ...prev,
        fecha: preselectedDate.toISOString().split('T')[0]
      }))
    }
  }, [preselectedDate])

  // Reset form when drawer closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        mascota_id: '',
        fecha: new Date().toISOString().split('T')[0],
        hora_inicio: '10:00',
        servicio: 'Corte',
      })
    }
  }, [isOpen])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.mascota_id) {
      toast({
        title: 'Error',
        description: 'Por favor selecciona una mascota',
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)
    try {
      // mascota_id is already a UUID string from the combobox
      if (!formData.mascota_id || typeof formData.mascota_id !== 'string' || formData.mascota_id.trim() === '') {
        throw new Error('ID de mascota inválido')
      }

      console.log('[v0] Enviando datos:', { mascota_id: formData.mascota_id, fecha: formData.fecha, hora_inicio: formData.hora_inicio, servicio: formData.servicio })

      const result = await crearTurno({
        mascota_id: formData.mascota_id,  // Send UUID string directly
        fecha: formData.fecha,
        hora_inicio: formData.hora_inicio,
        servicio: formData.servicio,
      })

      console.log('[v0] Respuesta del servidor:', result)

      if (result.success) {
        console.log('[v0] Turno creado exitosamente')
        toast({
          title: 'Éxito',
          description: 'Turno creado correctamente',
        })
        // Close drawer after success
        onOpenChange(false)
      } else {
        // Extract error message safely - ensure it's never undefined/null
        const errorMsg = (result.error ? String(result.error).trim() : '') || 'Error al crear el turno'
        console.log('[v0] Error al crear turno:', errorMsg, 'Tipo:', typeof errorMsg)
        toast({
          title: 'Error',
          description: errorMsg,
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('[v0] Error en handleSubmit:', error)
      const errorMsg = (error instanceof Error ? error.message.trim() : '') || 'Error desconocido'
      console.log('[v0] Mensaje de error a mostrar:', errorMsg, 'Tipo:', typeof errorMsg)
      toast({
        title: 'Error',
        description: errorMsg || 'Hubo un error al crear el turno',
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
          <DrawerTitle className="font-heading">Nuevo Turno</DrawerTitle>
          <DrawerDescription>
            Completa los datos para agendar un nuevo turno
          </DrawerDescription>
        </DrawerHeader>

        <form onSubmit={handleSubmit} className="px-4 pb-6 space-y-4">
          {/* Mascota Combobox */}
          <div className="space-y-2">
            <Label htmlFor="mascota" className="font-heading">Mascota</Label>
            <PetCombobox
              pets={pets}
              value={formData.mascota_id}
              onValueChange={(value) => handleInputChange('mascota_id', value)}
            />
          </div>

          {/* Fecha Input */}
          <div className="space-y-2">
            <Label htmlFor="fecha" className="font-heading">Fecha</Label>
            <Input
              id="fecha"
              type="date"
              value={formData.fecha}
              onChange={(e) => handleInputChange('fecha', e.target.value)}
            />
          </div>

          {/* Hora Input */}
          <div className="space-y-2">
            <Label htmlFor="hora" className="font-heading">Hora</Label>
            <Input
              id="hora"
              type="time"
              value={formData.hora_inicio}
              onChange={(e) => handleInputChange('hora_inicio', e.target.value)}
            />
          </div>

          {/* Servicio Select */}
          <div className="space-y-2">
            <Label htmlFor="servicio" className="font-heading">Servicio</Label>
            <Select
              value={formData.servicio}
              onValueChange={(value) => handleInputChange('servicio', value)}
            >
              <SelectTrigger id="servicio">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Corte">Corte</SelectItem>
                <SelectItem value="Baño">Baño</SelectItem>
                <SelectItem value="Corte y Baño">Corte y Baño</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Submit Button with loading state */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-heading"
          >
            {isLoading ? 'Guardando...' : 'Guardar Turno'}
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
      </DrawerContent>
    </Drawer>
  )
}
