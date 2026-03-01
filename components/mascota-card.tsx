import { Card } from '@/components/ui/card'

interface PetWithClient {
  id: string
  nombre: string
  raza: string
  tipo_animal: string
  cliente_nombre?: string
  cliente_telefono?: string
}

interface MascotaCardProps {
  pet: PetWithClient
  onSelect: () => void
}

export default function MascotaCard({ pet, onSelect }: MascotaCardProps) {
  return (
    <Card
      onClick={onSelect}
      className="bg-card border-border overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
    >
      <div className="p-3 space-y-1">
        {/* Pet Name */}
        <h3 className="text-base font-heading font-semibold text-primary">
          {pet.nombre}
        </h3>

        {/* Race and Type */}
        <p className="text-sm text-foreground/70">
          {pet.raza} · {pet.tipo_animal}
        </p>

        {/* Owner Name */}
        {pet.cliente_nombre && (
          <p className="text-xs text-muted-foreground">
            Dueño: {pet.cliente_nombre}
          </p>
        )}
      </div>
    </Card>
  )
}
