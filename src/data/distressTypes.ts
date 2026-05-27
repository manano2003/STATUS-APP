import type { DistressType } from './store'
import medicalImg from '../assets/distress-medical.png'
import fireImg from '../assets/distress-fire.png'
import missileImg from '../assets/distress-missile.png'
import terrorImg from '../assets/distress-terror.png'

export interface DistressTypeInfo {
  id: DistressType
  label: string
  imageUrl: string
  color: string
}

export const distressTypes: DistressTypeInfo[] = [
  { id: 'medical', label: 'רפואי', imageUrl: medicalImg, color: '#cc2222' },
  { id: 'fire', label: 'שריפה', imageUrl: fireImg, color: '#ff6600' },
  { id: 'missile', label: 'נפילת טיל', imageUrl: missileImg, color: '#4488cc' },
  { id: 'terror', label: 'אירוע חבלני', imageUrl: terrorImg, color: '#ff4444' },
]

export function getDistressTypeInfo(type: DistressType): DistressTypeInfo {
  return distressTypes.find(d => d.id === type)!
}
