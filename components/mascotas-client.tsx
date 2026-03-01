'use client'

import { useState, useMemo } from 'react'
import { Search, Plus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import MascotaCard from '@/components/mascota-card'
import MascotaDetailDrawer from '@/components/mascota-detail-drawer'
import NewMascotaForm from '@/components/new-mascota-form'
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
  const [isNewMascotaOpen, setIsNewMascotaOpen] = useState(false)

  // Filter pets based on search term
  const filteredPets = useMemo(() => {
    if (!searchTerm) return initialPets

    const term = searchTerm.toLowerCase()
    return initialPets.filter(pet =>
      pet.nombre.toLowerCase().includes(term) ||
      pet.raza.toLowerCase().includes(term) ||
      pet.cliente_nombre?.toLowerCase().includes(term)
    )
  }, [initialPets, searchTerm])

  const handlePetSelect = (petId: string) => {
    setSelectedPetId(petId)
    setIsDetailOpen(true)
  }

  return (
    <>
      {/* Sticky Search Bar */}
      <div className="fixed top-20 left-0 right-0 z-50 bg-background border-b border-border">
        <div className="max-w-md mx-auto px-4 py-3 flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar mascota o dueño..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-card"
            />
          </div>
          <Button
            onClick={() => setIsNewMascotaOpen(true)}
            size="icon"
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
            title="Nueva mascota"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Pets Grid - Responsive */}
      <div className="pt-20">
        {filteredPets.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              {searchTerm ? 'No se encontraron mascotas' : 'No hay mascotas registradas'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredPets.map(pet => (
              <MascotaCard
                key={pet.id}
                pet={pet}
                onSelect={() => handlePetSelect(pet.id)}
              />
            ))}
          </div>
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

      {/* New Mascota Form */}
      <NewMascotaForm
        isOpen={isNewMascotaOpen}
        onOpenChange={setIsNewMascotaOpen}
        onSuccess={() => {
          // Optionally refresh the page
          window.location.reload()
        }}
      />
    </>
  )
}
