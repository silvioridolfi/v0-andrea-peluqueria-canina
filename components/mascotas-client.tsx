'use client'

import { useState, useMemo } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import MascotaCard from '@/components/mascota-card'
import MascotaDetailDrawer from '@/components/mascota-detail-drawer'
import { getPetsWithClients } from '@/lib/db'

interface PetWithClient {
  id: string
  nombre: string
  raza: string
  tipo_animal: string
  cliente_nombre?: string
  cliente_telefono?: string
}

interface MascotasClientProps {
  initialPets: PetWithClient[]
}

export default function MascotasClient({ initialPets }: MascotasClientProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  // Filter pets based on search term
  const filteredPets = useMemo(() => {
    if (!searchTerm) return initialPets

    const term = searchTerm.toLowerCase()
    return initialPets.filter(pet =>
      pet.nombre.toLowerCase().includes(term) ||
      pet.cliente_nombre?.toLowerCase().includes(term)
    )
  }, [initialPets, searchTerm])

  const handlePetSelect = (petId: string) => {
    setSelectedPetId(petId)
    setIsDetailOpen(true)
  }

  return (
    <>
      {/* Search Input */}
      <div className="sticky top-20 z-20 bg-background/95 backdrop-blur -mx-4 px-4 py-3 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar mascota o dueño..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-card"
          />
        </div>
      </div>

      {/* Pets List */}
      <div className="space-y-2 pt-2">
        {filteredPets.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              {searchTerm ? 'No se encontraron mascotas' : 'No hay mascotas registradas'}
            </p>
          </div>
        ) : (
          filteredPets.map(pet => (
            <MascotaCard
              key={pet.id}
              pet={pet}
              onSelect={() => handlePetSelect(pet.id)}
            />
          ))
        )}
      </div>

      {/* Mascota Detail Drawer */}
      {selectedPetId && (
        <MascotaDetailDrawer
          petId={selectedPetId}
          isOpen={isDetailOpen}
          onOpenChange={setIsDetailOpen}
        />
      )}
    </>
  )
}
