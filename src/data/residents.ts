export interface Resident {
  id: string
  name: string
  phone: string
  category: "resident" | "duc" | "caregiver"
}

import { supabase } from './supabase'

export async function loadResidents(): Promise<Resident[]> {
  const { data } = await supabase.from('residents').select('id,full_name,phone,category')
  if (!data) return []
  return data.map(r => ({ id: r.id, name: r.full_name, phone: r.phone || '', category: r.category || 'resident' }))
}

// For backwards compatibility - empty array, use loadResidents() instead
export const residents: Resident[] = []
