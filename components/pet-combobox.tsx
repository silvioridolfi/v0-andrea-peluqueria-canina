'use client'

import { useState } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { Pet } from '@/lib/db'

interface PetComboboxProps {
  pets: Pet[]
  value: string
  onValueChange: (value: string) => void
}

export default function PetCombobox({ pets, value, onValueChange }: PetComboboxProps) {
  const [open, setOpen] = useState(false)

  const selectedPet = pets.find(pet => pet.id.toString() === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedPet
            ? `${selectedPet.nombre} (${selectedPet.raza || 'Raza desconocida'})`
            : 'Selecciona una mascota...'}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command
          filter={(value, search) => {
            // Case-insensitive search: compare lowercase versions
            const searchLower = search.toLowerCase()
            const pet = pets.find(p => p.id.toString() === value)
            
            if (!pet) return 0
            
            // Search in nombre y raza (both lowercased), handle null raza
            if (
              pet.nombre.toLowerCase().includes(searchLower) ||
              (pet.raza && pet.raza.toLowerCase().includes(searchLower))
            ) {
              return 1
            }
            return 0
          }}
        >
          <CommandInput placeholder="Buscar mascota..." />
          <CommandEmpty>No se encontró mascota.</CommandEmpty>
          <CommandList>
            <CommandGroup>
              {pets.map(pet => (
                <CommandItem
                  key={pet.id}
                  value={pet.id.toString()}  // Pass numeric ID as string
                  onSelect={(currentValue) => {
                    onValueChange(currentValue === value ? '' : currentValue)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === pet.id.toString() ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <div className="flex flex-col">
                    <span>{pet.nombre}</span>
                    <span className="text-xs text-slate-500">{pet.raza || 'Raza desconocida'}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
