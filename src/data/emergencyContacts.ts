import type { DistressType } from './store'
import { supabase } from './supabase'

export interface EmergencyContact {
  name: string
  phone: string
}

export async function loadEmergencyContacts(): Promise<Record<DistressType, EmergencyContact[]>> {
  const { data } = await supabase.from('emergency_contacts').select('name,role,phone')
  const result: Record<DistressType, EmergencyContact[]> = { medical: [], fire: [], missile: [], terror: [] }
  if (data) {
    data.forEach(c => {
      const type = c.role as DistressType
      if (result[type]) result[type].push({ name: c.name, phone: c.phone })
    })
  }
  return result
}

export const emergencyContacts: Record<DistressType, EmergencyContact[]> = { medical: [], fire: [], missile: [], terror: [] }
