import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getWhatsAppLink(phone: string | null | undefined, message: string) {
  if (!phone) return null
  // Remove non-numeric characters
  const cleanPhone = phone.replace(/\D/g, '')
  // Encode message
  const encodedMessage = encodeURIComponent(message)
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`
}
