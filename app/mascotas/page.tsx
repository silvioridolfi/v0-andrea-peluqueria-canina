import { getPetsWithClients, getAllPets } from '@/lib/db'
import MascotasClient from '@/components/mascotas-client'
import BottomNavigation from '@/components/bottom-navigation'

export const metadata = {
  title: 'Andrea | Peluquería Canina - Mascotas',
  description: 'Gestión de mascotas y clientes'
}

export default async function MascotasPage() {
  // Get all pets with client info
  let petsWithClients = []
  try {
    petsWithClients = await getPetsWithClients()
  } catch (error) {
    console.error('Error fetching pets:', error)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-10 bg-background border-b border-border">
        <div className="max-w-md mx-auto px-4 py-4 text-center">
          <h1 className="text-2xl font-heading font-bold text-primary">
            Andrea <span className="text-accent">|</span> Mascotas
          </h1>
        </div>
      </header>

      {/* Main content area */}
      <main className="max-w-md mx-auto pt-24 pb-24">
        <div className="px-4 space-y-3">
          <MascotasClient initialPets={petsWithClients} />
        </div>
      </main>

      <BottomNavigation activeTab="mascotas" />
    </div>
  )
}
