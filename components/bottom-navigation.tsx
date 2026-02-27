'use client'

import { useRouter, usePathname } from 'next/navigation'
import { Calendar, Clock, PawPrint, DollarSign } from 'lucide-react'

interface BottomNavigationProps {
  activeTab?: 'hoy' | 'agenda' | 'mascotas' | 'finanzas'
}

export default function BottomNavigation({ activeTab = 'hoy' }: BottomNavigationProps) {
  const router = useRouter()
  const pathname = usePathname()

  // Determine active tab from pathname if not provided
  const currentTab = activeTab || (pathname?.includes('/agenda') ? 'agenda' : 'hoy')

  const navItems = [
    { id: 'hoy', label: 'Hoy', icon: Calendar, href: '/' },
    { id: 'agenda', label: 'Agenda', icon: Clock, href: '/agenda' },
    { id: 'mascotas', label: 'Mascotas', icon: PawPrint, href: '/mascotas' },
    { id: 'finanzas', label: 'Finanzas', icon: DollarSign, href: '/finanzas' }
  ]

  const handleNavigate = (href: string) => {
    router.push(href)
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-10 bg-card border-t border-border">
      <div className="max-w-md mx-auto flex justify-around">
        {navItems.map(item => {
          const Icon = item.icon
          const isActive = currentTab === item.id
          
          return (
            <button
              key={item.id}
              onClick={() => handleNavigate(item.href)}
              className={`flex-1 flex flex-col items-center justify-center py-3 transition-colors ${
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon size={24} />
              <span className="text-xs mt-1 font-heading">{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
