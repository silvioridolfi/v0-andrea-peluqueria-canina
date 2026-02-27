'use client'

import { Calendar, Clock, PawPrint, DollarSign } from 'lucide-react'

interface BottomNavigationProps {
  activeTab?: 'hoy' | 'agenda' | 'mascotas' | 'finanzas'
}

export default function BottomNavigation({ activeTab = 'hoy' }: BottomNavigationProps) {
  const navItems = [
    { id: 'hoy', label: 'Hoy', icon: Calendar },
    { id: 'agenda', label: 'Agenda', icon: Clock },
    { id: 'mascotas', label: 'Mascotas', icon: PawPrint },
    { id: 'finanzas', label: 'Finanzas', icon: DollarSign }
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-10 bg-white border-t border-slate-200">
      <div className="max-w-md mx-auto flex justify-around">
        {navItems.map(item => {
          const Icon = item.icon
          const isActive = activeTab === item.id
          
          return (
            <button
              key={item.id}
              className={`flex-1 flex flex-col items-center justify-center py-3 transition-colors ${
                isActive
                  ? 'bg-amber-100 text-amber-700'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Icon size={24} />
              <span className="text-xs mt-1">{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
