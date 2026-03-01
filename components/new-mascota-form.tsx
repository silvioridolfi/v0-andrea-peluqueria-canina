'use client'

import { useState } from 'react'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { crearMascotaConCliente } from '@/lib/actions'

interface NewMascotaFormProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export default function NewMascotaForm({
  isOpen,
  onOpenChange,
  onSuccess
}: NewMascotaFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    mascota_nombre: '',
    mascota_raza: '',
    mascota_tamaño: '',
    mascota_sexo: '',
    mascota_notas: '',
    cliente_nombre: '',
    cliente_telefono: ''
  })
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validate required fields
      if (!formData.mascota_nombre.trim() || !formData.cliente_nombre.trim() || !formData.cliente_telefono.trim()) {
        toast({
          title: 'Error',
          description: 'Por favor completa los campos requeridos',
          variant: 'destructive'
        })
        setIsLoading(false)
        return
      }

      const result = await crearMascotaConCliente({
        mascota_nombre: formData.mascota_nombre,
        mascota_raza: formData.mascota_raza,
        mascota_tamaño: formData.mascota_tamaño || undefined,
        mascota_sexo: formData.mascota_sexo || undefined,
        mascota_notas: formData.mascota_notas || undefined,
        cliente_nombre: formData.cliente_nombre,
        cliente_telefono: formData.cliente_telefono
      })

      if (result.success) {
        toast({
          title: 'Éxito',
          description: 'Mascota y dueño registrados correctamente'
        })
        
        // Reset form
        setFormData({
          mascota_nombre: '',
          mascota_raza: '',
          mascota_tamaño: '',
          mascota_sexo: '',
          mascota_notas: '',
          cliente_nombre: '',
          cliente_telefono: ''
        })
        
        onOpenChange(false)
        onSuccess?.()
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Error al registrar la mascota',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('[v0] Error creating mascota:', error)
      toast({
        title: 'Error',
        description: 'Error al registrar la mascota',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent className="bg-background border-border">
        <DrawerHeader>
          <DrawerTitle className="font-heading">Nueva Mascota</DrawerTitle>
        </DrawerHeader>

        <form onSubmit={handleSubmit} className="px-4 pb-6 space-y-4 overflow-y-auto max-h-96">
          {/* Mascota Section */}
          <div className="space-y-3 pb-4 border-b border-border">
            <h3 className="text-sm font-heading font-semibold text-foreground">Datos de la Mascota</h3>
            
            <div className="space-y-2">
              <Label htmlFor="mascota_nombre" className="font-heading">Nombre *</Label>
              <Input
                id="mascota_nombre"
                placeholder="Ej: Max"
                value={formData.mascota_nombre}
                onChange={(e) => setFormData({ ...formData, mascota_nombre: e.target.value })}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mascota_raza" className="font-heading">Raza</Label>
              <Input
                id="mascota_raza"
                placeholder="Ej: Golden Retriever"
                value={formData.mascota_raza}
                onChange={(e) => setFormData({ ...formData, mascota_raza: e.target.value })}
                disabled={isLoading}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label htmlFor="mascota_tamaño" className="font-heading">Tamaño</Label>
                <select
                  id="mascota_tamaño"
                  value={formData.mascota_tamaño}
                  onChange={(e) => setFormData({ ...formData, mascota_tamaño: e.target.value })}
                  disabled={isLoading}
                  className="w-full px-3 py-2 bg-card border border-border rounded-md text-sm font-heading"
                >
                  <option value="">Seleccionar</option>
                  <option value="Pequeño">Pequeño</option>
                  <option value="Mediano">Mediano</option>
                  <option value="Grande">Grande</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mascota_sexo" className="font-heading">Sexo</Label>
                <select
                  id="mascota_sexo"
                  value={formData.mascota_sexo}
                  onChange={(e) => setFormData({ ...formData, mascota_sexo: e.target.value })}
                  disabled={isLoading}
                  className="w-full px-3 py-2 bg-card border border-border rounded-md text-sm font-heading"
                >
                  <option value="">Seleccionar</option>
                  <option value="Macho">Macho</option>
                  <option value="Hembra">Hembra</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mascota_notas" className="font-heading">Notas</Label>
              <Textarea
                id="mascota_notas"
                placeholder="Ej: Tiene alergias, es miedoso..."
                value={formData.mascota_notas}
                onChange={(e) => setFormData({ ...formData, mascota_notas: e.target.value })}
                disabled={isLoading}
                className="min-h-[80px] resize-none"
              />
            </div>
          </div>

          {/* Cliente Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-heading font-semibold text-foreground">Datos del Dueño</h3>
            
            <div className="space-y-2">
              <Label htmlFor="cliente_nombre" className="font-heading">Nombre del Dueño *</Label>
              <Input
                id="cliente_nombre"
                placeholder="Ej: Juan García"
                value={formData.cliente_nombre}
                onChange={(e) => setFormData({ ...formData, cliente_nombre: e.target.value })}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cliente_telefono" className="font-heading">Teléfono *</Label>
              <Input
                id="cliente_telefono"
                type="tel"
                placeholder="Ej: +54 11 1234-5678"
                value={formData.cliente_telefono}
                onChange={(e) => setFormData({ ...formData, cliente_telefono: e.target.value })}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isLoading ? 'Guardando...' : 'Registrar'}
            </Button>
          </div>
        </form>
      </DrawerContent>
    </Drawer>
  )
}
