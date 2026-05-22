import type { DistressType } from './store'

function makePlaceholder(text: string, color: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="${color}"/><text x="100" y="110" text-anchor="middle" fill="white" font-size="20" font-family="Arial">${text}</text></svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

export interface DistressTypeInfo {
  id: DistressType
  label: string
  imageUrl: string
  color: string
}

export const distressTypes: DistressTypeInfo[] = [
  { id: 'medical', label: 'רפואי', imageUrl: makePlaceholder('רפואי', '#cc2222'), color: '#cc2222' },
  { id: 'fire', label: 'שריפה', imageUrl: makePlaceholder('שריפה', '#ff6600'), color: '#ff6600' },
  { id: 'missile', label: 'נפילת טיל', imageUrl: makePlaceholder('נפילת טיל', '#4488cc'), color: '#4488cc' },
  { id: 'terror', label: 'אירוע חבלני', imageUrl: makePlaceholder('אירוע חבלני', '#ff4444'), color: '#ff4444' },
]

export function getDistressTypeInfo(type: DistressType): DistressTypeInfo {
  return distressTypes.find(d => d.id === type)!
}
