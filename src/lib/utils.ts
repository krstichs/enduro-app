import { type ClassValue, clsx } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

// Format vremena za timer
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// Format težine
export function formatWeight(weight: number, unit: 'kg' | 'lbs' = 'kg'): string {
  return `${weight}${unit}`
}