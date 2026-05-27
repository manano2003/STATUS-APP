export interface Resident {
  id: string
  name: string
  phone: string
  category: "resident" | "duc" | "caregiver"
}

import { supabase } from './supabase'

export async function loadResidents(): Promise<Resident[]> {
  try {
    const { data } = await supabase.from('residents').select('id,full_name,phone,category')
    if (data && data.length > 0) {
      const residents = data.map(r => ({ id: r.id, name: r.full_name, phone: r.phone || '', category: (r.category || 'resident') as Resident['category'] }))
      localStorage.setItem('cache_residents', JSON.stringify(residents))
      return residents
    }
  } catch {}
  // Fallback to cache
  try {
    const cached = localStorage.getItem('cache_residents')
    if (cached) return JSON.parse(cached)
  } catch {}
  return []
}

// For backwards compatibility - empty array, use loadResidents() instead
export const residents: Resident[] = []
