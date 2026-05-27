import { type Kindergarten } from './kindergartens'
import { type Club } from './clubs'
import { type Shelter } from './shelters'
import { supabase } from './supabase'

const KG_CACHE_KEY = 'source_kindergartens'
const CLUBS_CACHE_KEY = 'source_clubs'
const SHELTERS_CACHE_KEY = 'source_shelters'

// Load from DB, cache locally for offline/speed
export async function loadSourceKindergartensFromDB(): Promise<Kindergarten[]> {
  const { data } = await supabase.from('source_kindergartens').select('*')
  if (data && data.length > 0) {
    const kgs = data.map((row: any) => ({
      id: row.kg_id,
      name: row.name,
      children: row.children || [],
      staff: row.staff || [],
    }))
    localStorage.setItem(KG_CACHE_KEY, JSON.stringify(kgs))
    return kgs
  }
  return getSourceKindergartens()
}

export async function loadSourceClubsFromDB(): Promise<Club[]> {
  const { data } = await supabase.from('source_clubs').select('*')
  if (data && data.length > 0) {
    const clubs = data.map((row: any) => ({
      id: row.club_id,
      name: row.name,
      children: row.children || [],
      staff: row.staff || [],
    }))
    localStorage.setItem(CLUBS_CACHE_KEY, JSON.stringify(clubs))
    return clubs
  }
  return getSourceClubs()
}

// Save to DB + localStorage
export async function saveSourceKindergartensToDB(data: Kindergarten[], callerId: string): Promise<boolean> {
  localStorage.setItem(KG_CACHE_KEY, JSON.stringify(data))
  const { data: result } = await supabase.rpc('save_source_kindergartens', {
    caller_id: callerId,
    kg_data: data,
  })
  return result?.success || false
}

export async function saveSourceClubsToDB(data: Club[], callerId: string): Promise<boolean> {
  localStorage.setItem(CLUBS_CACHE_KEY, JSON.stringify(data))
  const { data: result } = await supabase.rpc('save_source_clubs', {
    caller_id: callerId,
    club_data: data,
  })
  return result?.success || false
}

// Sync getters - read from localStorage cache (fast, works offline)
export function getSourceKindergartens(): Kindergarten[] {
  try {
    const saved = localStorage.getItem(KG_CACHE_KEY)
    if (saved) return JSON.parse(saved)
  } catch {}
  return []
}

export function saveSourceKindergartens(data: Kindergarten[]) {
  localStorage.setItem(KG_CACHE_KEY, JSON.stringify(data))
}

export function getKindergartenById(id: string): Kindergarten | undefined {
  return getSourceKindergartens().find(k => k.id === id)
}

export function getSourceClubs(): Club[] {
  try {
    const saved = localStorage.getItem(CLUBS_CACHE_KEY)
    if (saved) return JSON.parse(saved)
  } catch {}
  return []
}

export function saveSourceClubs(data: Club[]) {
  localStorage.setItem(CLUBS_CACHE_KEY, JSON.stringify(data))
}

export function getClubById(id: string): Club | undefined {
  return getSourceClubs().find(c => c.id === id)
}

// --- Source Shelters ---

export async function loadSourceSheltersFromDB(): Promise<Shelter[]> {
  const { data } = await supabase.from('source_shelters').select('*')
  if (data && data.length > 0) {
    const shelters = data.map((row: any) => ({
      id: row.id,
      name: row.name,
      number: row.shelter_number,
      imageUrl: row.image_url || '',
      isSpecialStatus: row.is_special_status || false,
    }))
    localStorage.setItem(SHELTERS_CACHE_KEY, JSON.stringify(shelters))
    return shelters
  }
  return getSourceShelters()
}

export async function saveSourceSheltersToDB(data: Shelter[], callerId: string): Promise<boolean> {
  localStorage.setItem(SHELTERS_CACHE_KEY, JSON.stringify(data))
  const { data: result } = await supabase.rpc('save_source_shelters', {
    caller_id: callerId,
    shelter_data: data,
  })
  return result?.success || false
}

export function getSourceShelters(): Shelter[] {
  try {
    const saved = localStorage.getItem(SHELTERS_CACHE_KEY)
    if (saved) return JSON.parse(saved)
  } catch {}
  return []
}

export function saveSourceShelters(data: Shelter[]) {
  localStorage.setItem(SHELTERS_CACHE_KEY, JSON.stringify(data))
}

// --- Source Residents ---

const RESIDENTS_CACHE_KEY = 'source_residents'

export async function loadSourceResidentsFromDB(): Promise<string[]> {
  const { data } = await supabase.from('residents').select('full_name')
  if (data && data.length > 0) {
    const names = data.map((row: any) => row.full_name as string).filter(Boolean)
    localStorage.setItem(RESIDENTS_CACHE_KEY, JSON.stringify(names))
    return names
  }
  return getSourceResidents()
}

export function getSourceResidents(): string[] {
  try {
    const saved = localStorage.getItem(RESIDENTS_CACHE_KEY)
    if (saved) return JSON.parse(saved)
  } catch {}
  return []
}

export function saveSourceResidents(names: string[]) {
  localStorage.setItem(RESIDENTS_CACHE_KEY, JSON.stringify(names))
}

export async function saveSourceResidentsToDB(names: string[], callerId: string): Promise<boolean> {
  localStorage.setItem(RESIDENTS_CACHE_KEY, JSON.stringify(names))
  const { data: result } = await supabase.rpc('save_source_residents', {
    caller_id: callerId,
    resident_data: names,
  })
  return result?.success || false
}

// --- Source Issues ---

const ISSUES_CACHE_KEY = 'source_issues'

export async function loadSourceIssuesFromDB(): Promise<string[]> {
  const { data } = await supabase.from('source_issues').select('*').order('sort_order')
  if (data && data.length > 0) {
    const issues = data.map((row: any) => row.issue_text as string).filter(Boolean)
    localStorage.setItem(ISSUES_CACHE_KEY, JSON.stringify(issues))
    return issues
  }
  return getSourceIssues()
}

export function getSourceIssues(): string[] {
  try {
    const saved = localStorage.getItem(ISSUES_CACHE_KEY)
    if (saved) return JSON.parse(saved)
  } catch {}
  return []
}

export function saveSourceIssues(issues: string[]) {
  localStorage.setItem(ISSUES_CACHE_KEY, JSON.stringify(issues))
}

export async function saveSourceIssuesToDB(issues: string[], callerId: string): Promise<boolean> {
  localStorage.setItem(ISSUES_CACHE_KEY, JSON.stringify(issues))
  const { data: result } = await supabase.rpc('save_source_issues', {
    caller_id: callerId,
    issue_data: issues.map((text, i) => ({ issue_text: text, sort_order: i })),
  })
  return result?.success || false
}
