'use client'

import { useState } from 'react'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { updateMascotaCliente } from '@/lib/actions'
import { useToast } from '@/hooks/use-toast'

interface MascotaEditFormProps {
  petId: string
  petDetail: any
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSave: () => void
}

export default function MascotaEditForm({
  petId,
  petDetail,
  isOpen,
  onOpenChange,
  onSave
}: MascotaEditFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    notas: petDetail?.notas || '',
    telefono: petDetail?.cliente_telefono || ''
  })
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await updateMascotaCliente(petId, petDetail?.cliente_id, {
        notas: formData.notas,
        telefono: formData.telefono || undefined
      })

      if (result.success) {
        toast({
          title: 'Éxito',
          description: 'Los cambios han sido guardados'
        })
        onSave()
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Error al guardar los cambios',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('[v0] Error saving pet:', error)
      toast({
        title: 'Error',
        description: 'Error al guardar los cambios',
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
          <DrawerTitle className="font-heading">Editar {petDetail?.nombre}</DrawerTitle>
        </DrawerHeader>

        <form onSubmit={handleSubmit} className="px-4 pb-6 space-y-4">
          {/* Notas */}
          <div className="space-y-2">
            <Label htmlFor="notas" className="font-heading">
              Notas de la Mascota
            </Label>
            <Textarea
              id="notas"
              placeholder="Ej: Tiene miedo al secador, le gusta el baño caliente..."
              value={formData.notas}
              onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
              className="min-h-[100px] resize-none"
            />
          </div>

          {/* Teléfono */}
          {petDetail?.cliente_nombre && (
            <div className="space-y-2">
              <Label htmlFor="telefono" className="font-heading">
                Teléfono del Dueño
              </Label>
              <Input
                id="telefono"
                type="tel"
                placeholder="+54 11 1234-5678"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              />
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-heading"
            >
              {isLoading ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="flex-1 font-heading"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </DrawerContent>
    </Drawer>
  )
}
