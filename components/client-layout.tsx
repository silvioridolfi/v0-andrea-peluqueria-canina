'use client'

import { useState } from 'react'
import FABButton from '@/components/fab-button'
import NewAppointmentForm from '@/components/new-appointment-form'
import { Pet } from '@/lib/db'

export default function ClientLayout({ pets }: { pets: Pet[] }) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const handleAddAppointment = () => {
    setIsDrawerOpen(true)
  }

  return (
    <>
      <NewAppointmentForm 
        pets={pets} 
        isOpen={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
      />
      <FABButton onClick={handleAddAppointment} />
    </>
  )
}
