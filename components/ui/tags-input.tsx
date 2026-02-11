'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

interface TagsInputProps {
  value: string[]
  onChange: (values: string[]) => void
  placeholder?: string
  disabled?: boolean
  suggestedValues?: string[]
}

export default function TagsInput({
  value,
  onChange,
  placeholder = 'Escribe y presiona Enter',
  disabled = false,
  suggestedValues = [],
}: TagsInputProps) {
  const [inputValue, setInputValue] = useState('')

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag(inputValue.trim())
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      removeTag(value.length - 1)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  const addTag = (tag: string) => {
    if (tag && !value.includes(tag)) {
      onChange([...value, tag])
      setInputValue('')
    }
  }

  const removeTag = (index: number) => {
    onChange(value.filter((_, i) => i !== index))
  }

  const addSuggestedTag = (tag: string) => {
    if (!value.includes(tag)) {
      onChange([...value, tag])
    }
  }

  return (
    <div className="space-y-3">
      <div className="border rounded-lg p-3 bg-background">
        <div className="flex flex-wrap gap-2 mb-2">
          {value.map((tag, index) => (
            <div
              key={index}
              className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(index)}
                disabled={disabled}
                className="hover:text-blue-600 disabled:opacity-50"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
        <Input
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="border-0 focus-visible:ring-0 p-0 h-auto text-sm"
        />
      </div>

      {suggestedValues.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Sugerencias:</p>
          <div className="flex flex-wrap gap-2">
            {suggestedValues
              .filter((tag) => !value.includes(tag))
              .map((tag, index) => (
                <Button
                  key={index}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addSuggestedTag(tag)}
                  disabled={disabled}
                  className="text-xs h-auto py-1"
                >
                  + {tag}
                </Button>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}
