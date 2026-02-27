'use client'

import { Plus } from 'lucide-react'

interface FABButtonProps {
  onClick?: () => void
}

export default function FABButton({ onClick }: FABButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-20 right-4 z-20 bg-amber-600 hover:bg-amber-700 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition-colors active:scale-95"
      aria-label="Add new appointment"
    >
      <Plus size={28} />
    </button>
  )
}
