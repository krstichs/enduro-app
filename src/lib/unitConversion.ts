// Weight conversion
export const convertWeight = (value: number, from: 'kg' | 'lbs', to: 'kg' | 'lbs'): number => {
  if (from === to) return value
  if (from === 'kg' && to === 'lbs') return value * 2.20462
  if (from === 'lbs' && to === 'kg') return value / 2.20462
  return value
}

// Distance conversion
export const convertDistance = (value: number, from: 'km' | 'miles', to: 'km' | 'miles'): number => {
  if (from === to) return value
  if (from === 'km' && to === 'miles') return value * 0.621371
  if (from === 'miles' && to === 'km') return value / 0.621371
  return value
}

// Format with unit
export const formatWithUnit = (value: number, unit: 'kg' | 'lbs' | 'km' | 'miles'): string => {
  if (typeof value !== 'number') return '0' + (unit === 'kg' ? ' kg' : unit === 'lbs' ? ' lbs' : unit === 'km' ? ' km' : ' mi')
  
  const rounded = Math.round(value * 10) / 10
  const units = {
    kg: ' kg',
    lbs: ' lbs',
    km: ' km',
    miles: ' mi'
  }
  
  return rounded.toFixed(rounded === Math.floor(rounded) ? 0 : 1) + units[unit]
}