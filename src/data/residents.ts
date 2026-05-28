export interface Resident {
  id: string
  name: string
  phone: string
  category: "resident" | "duc" | "caregiver"
}

import { supabase } from './supabase'

export async function loadResidents(): Promise<Resident[]> {
  try {
    // Load from both residents table and users table, merge and deduplicate
    const [resResult, usersResult] = await Promise.all([
      supabase.from('residents').select('id,full_name,phone,category'),
      supabase.from('users').select('id,full_name,phone').eq('is_guest', false),
    ])
    const residentsList: Resident[] = (resResult.data || []).map(r => ({
      id: r.id, name: r.full_name, phone: r.phone || '', category: (r.category || 'resident') as Resident['category']
    }))
    const usersList: Resident[] = (usersResult.data || []).map(r => ({
      id: r.id, name: r.full_name, phone: r.phone || '', category: 'resident' as const
    }))

    // Deduplicate by normalized name
    const seen = new Set<string>()
    const merged: Resident[] = []
    for (const r of [...residentsList, ...usersList]) {
      const key = r.name.replace(/\s+/g, ' ').trim()
      if (!seen.has(key)) {
        seen.add(key)
        merged.push(r)
      }
    }
    merged.sort((a, b) => a.name.localeCompare(b.name, 'he'))

    if (merged.length > 0) {
      localStorage.setItem('cache_residents', JSON.stringify(merged))
    }
    return merged
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
