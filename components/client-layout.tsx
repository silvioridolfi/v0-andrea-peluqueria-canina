'use client'

import FABButton from '@/components/fab-button'

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const handleAddAppointment = () => {
    // TODO: Implement add appointment flow
    console.log('Add appointment clicked')
  }

  return (
    <>
      {children}
      <FABButton onClick={handleAddAppointment} />
    </>
  )
}
