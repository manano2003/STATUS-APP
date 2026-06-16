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

// ==================== SCHOOLS ====================

interface SchoolRecord { id: string; name: string; councilId: string }
interface SchoolClass { name: string; students: string[] }
interface SchoolUser { id: string; fullName: string; phone: string; email: string; className: string; roles?: string[] }
interface CouncilUser { id: string; fullName: string; phone: string; email: string; registeredAt: string }

// --- Schools ---
export async function loadSchoolsFromDB(): Promise<SchoolRecord[]> {
  const { data } = await supabase.from('schools').select('*')
  if (data && data.length > 0) {
    const schools = data.map((r: any) => ({ id: r.id, name: r.name, councilId: r.council_id }))
    localStorage.setItem('status_schools', JSON.stringify(schools))
    // Sync logos from DB
    const logos: Record<string, string> = {}
    data.forEach((r: any) => { if (r.logo_url) logos[r.id] = r.logo_url })
    if (Object.keys(logos).length > 0) {
      const existing = JSON.parse(localStorage.getItem('school_logos') || '{}')
      localStorage.setItem('school_logos', JSON.stringify({ ...existing, ...logos }))
    }
    return schools
  }
  return getSchoolsFromCache()
}

export function getSchoolsFromCache(): SchoolRecord[] {
  try { return JSON.parse(localStorage.getItem('status_schools') || '[]') } catch { return [] }
}

export async function saveSchoolsToDB(schools: SchoolRecord[], callerId: string): Promise<boolean> {
  localStorage.setItem('status_schools', JSON.stringify(schools))
  const { data: result, error } = await supabase.rpc('save_schools', { caller_id: callerId, school_data: JSON.parse(JSON.stringify(schools)) })
  if (error) console.error('saveSchoolsToDB error:', error)
  return result?.success || false
}

// --- School Classes ---
export async function loadSchoolClassesFromDB(schoolId: string): Promise<SchoolClass[]> {
  const { data } = await supabase.from('school_classes').select('*').eq('school_id', schoolId)
  if (data && data.length > 0) {
    const classes = data.map((r: any) => ({ name: r.class_name, students: r.students || [] }))
    localStorage.setItem(`school_classes_${schoolId}`, JSON.stringify(classes))
    return classes
  }
  return getSchoolClassesFromCache(schoolId)
}

export function getSchoolClassesFromCache(schoolId: string): SchoolClass[] {
  try { return JSON.parse(localStorage.getItem(`school_classes_${schoolId}`) || '[]') } catch { return [] }
}

export async function saveSchoolClassesToDB(schoolId: string, classes: SchoolClass[], callerId: string): Promise<boolean> {
  localStorage.setItem(`school_classes_${schoolId}`, JSON.stringify(classes))
  const { data: result } = await supabase.rpc('save_school_classes', {
    caller_id: callerId, p_school_id: schoolId, class_data: classes,
  })
  return result?.success || false
}

// --- School Users ---
export async function loadSchoolUsersFromDB(schoolId: string): Promise<SchoolUser[]> {
  const { data } = await supabase.from('school_users').select('*').eq('school_id', schoolId)
  if (data && data.length > 0) {
    const users = data.map((r: any) => ({
      id: r.user_id, fullName: r.full_name, phone: r.phone || '', email: r.email || '',
      className: r.class_name || '', roles: r.roles || [],
    }))
    localStorage.setItem(`school_users_${schoolId}`, JSON.stringify(users))
    return users
  }
  return getSchoolUsersFromCache(schoolId)
}

export function getSchoolUsersFromCache(schoolId: string): SchoolUser[] {
  try { return JSON.parse(localStorage.getItem(`school_users_${schoolId}`) || '[]') } catch { return [] }
}

export async function saveSchoolUsersToDB(schoolId: string, users: SchoolUser[], callerId: string): Promise<boolean> {
  localStorage.setItem(`school_users_${schoolId}`, JSON.stringify(users))
  const { data: result } = await supabase.rpc('save_school_users', {
    caller_id: callerId, p_school_id: schoolId, user_data: users,
  })
  return result?.success || false
}

// --- School Attendance ---
export async function loadSchoolAttendanceFromDB(schoolId: string, className: string, date: string): Promise<Record<string, boolean>> {
  const { data } = await supabase.from('school_attendance').select('attendance')
    .eq('school_id', schoolId).eq('class_name', className).eq('date', date).single()
  if (data) {
    const attendance = data.attendance || {}
    localStorage.setItem(`school_attendance_${schoolId}_${className}_${date}`, JSON.stringify(attendance))
    return attendance
  }
  return getSchoolAttendanceFromCache(schoolId, className, date)
}

export function getSchoolAttendanceFromCache(schoolId: string, className: string, date: string): Record<string, boolean> {
  try { return JSON.parse(localStorage.getItem(`school_attendance_${schoolId}_${className}_${date}`) || '{}') } catch { return {} }
}

export async function saveSchoolAttendanceToDB(schoolId: string, className: string, date: string, attendance: Record<string, boolean>, callerId: string): Promise<boolean> {
  localStorage.setItem(`school_attendance_${schoolId}_${className}_${date}`, JSON.stringify(attendance))
  const { data: result } = await supabase.rpc('save_school_attendance', {
    caller_id: callerId, p_school_id: schoolId, p_class_name: className, p_date: date, p_attendance: attendance,
  })
  return result?.success || false
}

// --- Council Users ---
export async function loadCouncilUsersFromDB(councilId: string): Promise<CouncilUser[]> {
  const { data } = await supabase.from('council_users').select('*').eq('council_id', councilId)
  if (data && data.length > 0) {
    const users = data.map((r: any) => ({
      id: String(r.id), fullName: r.full_name, phone: r.phone || '', email: r.email || '',
      registeredAt: r.registered_at || new Date().toISOString(),
    }))
    localStorage.setItem(`council_users_${councilId}`, JSON.stringify(users))
    return users
  }
  return getCouncilUsersFromCache(councilId)
}

export function getCouncilUsersFromCache(councilId: string): CouncilUser[] {
  try { return JSON.parse(localStorage.getItem(`council_users_${councilId}`) || '[]') } catch { return [] }
}

export async function saveCouncilUsersToDB(councilId: string, users: CouncilUser[], callerId: string): Promise<boolean> {
  localStorage.setItem(`council_users_${councilId}`, JSON.stringify(users))
  const { data: result } = await supabase.rpc('save_council_users', {
    caller_id: callerId, p_council_id: councilId, user_data: users,
  })
  return result?.success || false
}

// --- School Emergency ---
export async function loadSchoolEmergencyFromDB(schoolId: string): Promise<Record<string, string>> {
  const { data } = await supabase.from('school_emergency').select('class_name, status').eq('school_id', schoolId)
  if (data) {
    const map: Record<string, string> = {}
    data.forEach((r: any) => { map[r.class_name] = r.status })
    localStorage.setItem(`school_emergency_${schoolId}`, JSON.stringify(map))
    return map
  }
  return getSchoolEmergencyFromCache(schoolId)
}

export function getSchoolEmergencyFromCache(schoolId: string): Record<string, string> {
  try { return JSON.parse(localStorage.getItem(`school_emergency_${schoolId}`) || '{}') } catch { return {} }
}

export async function saveSchoolEmergencyToDB(schoolId: string, className: string, status: string, callerId: string): Promise<boolean> {
  const cache = getSchoolEmergencyFromCache(schoolId)
  cache[className] = status
  localStorage.setItem(`school_emergency_${schoolId}`, JSON.stringify(cache))
  const { data: result } = await supabase.rpc('save_school_emergency', {
    caller_id: callerId, p_school_id: schoolId, p_class_name: className, p_status: status,
  })
  return result?.success || false
}
