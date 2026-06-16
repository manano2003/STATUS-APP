import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import { supabase } from './supabase'
import { writeOrQueue } from './outbox'
import { showSaveStatus } from '../components/SaveIndicator'

async function safeRpc(rpcName: string, params: Record<string, any>): Promise<any> {
  showSaveStatus('saving')
  try {
    const { data, error } = await supabase.rpc(rpcName, params)
    if (error) throw error
    showSaveStatus('saved')
    return data
  } catch (err: any) {
    const result = await writeOrQueue(rpcName, params)
    if (result === null) {
      showSaveStatus('failed', 'יישלח כשהרשת תחזור')
    }
    return result
  }
}
// sourceData imports removed - using direct localStorage for restore reliability

export interface User {
  id: string
  email: string
  fullName: string
  phone: string
  city: string
  street: string
  houseNumber: string
  residents: number
  roles: string[]
  pin?: string
  isGuest?: boolean
}

export interface ShelterCheckin {
  id: string
  shelterId: string
  userId: string
  userName: string
  userPhone: string
  userHouseNumber: string
  peopleCount: number
  timestamp: number
  isGuest?: boolean
  registeredBy?: string
}

export type DistressType = 'medical' | 'fire' | 'missile' | 'terror'

export interface DistressAlert {
  id: string
  userId: string
  userName: string
  userPhone: string
  userHouseNumber: string
  type: DistressType
  timestamp: number
}

export interface KindergartenAttendance {
  kindergartenId: string
  presentChildren: string[]
  timestamp: number
  reportedBy: string
}

export interface ShelterIssueReport {
  id: string
  shelterId: string
  shelterName: string
  issues: string[]
  reportedBy: string
  timestamp: number
}

export type EmergencyStatusType = 'located-healthy' | 'located-evacuated' | 'missing' | 'harduf'

export interface ResidentEmergencyStatus {
  residentId: string
  status: EmergencyStatusType
  updatedBy: string
  updatedAt: number
}

export const EMERGENCY_STATUS_LABELS: Record<EmergencyStatusType, string> = {
  'located-healthy': 'מאותר-בריא',
  'located-evacuated': 'מאותר-מפונה',
  'missing': 'נעדר',
  'harduf': 'הרדוף',
}

export const EMERGENCY_STATUS_COLORS: Record<EmergencyStatusType, string> = {
  'located-healthy': '#4DE88A',
  'located-evacuated': '#4DA6E8',
  'missing': '#E84D4D',
  'harduf': '#E8C54D',
}

export interface ShelterDailySnapshot {
  id: string
  shelterId: string
  shelterName?: string
  date: string
  checkins: { userName: string; userPhone: string; userHouseNumber: string; peopleCount: number; isGuest?: boolean }[]
  timestamp: number
}

export interface KindergartenDailySnapshot {
  id: string
  kindergartenId: string
  date: string
  presentChildren: string[]
  reportedBy: string
  timestamp: number
}

export interface CheckinHistoryEntry {
  id: string
  shelterId: string
  shelterName: string
  userId: string
  userName: string
  userPhone: string
  userHouseNumber: string
  peopleCount: number
  checkinTime: number
  isGuest?: boolean
}

export interface IssueHistoryEntry {
  id: string
  shelterId: string
  shelterName: string
  issue: string
  reportedBy: string
  reportedAt: number
  resolvedBy: string
  resolvedAt: number
}

export interface DistressHistoryEntry {
  id: string
  userName: string
  userPhone: string
  userHouseNumber: string
  type: DistressType
  timestamp: number
  deletedBy: string
  deletedAt: number
}

export interface BackupUser {
  id: string
  originalId: string
  email: string
  fullName: string
  phone: string
  city: string
  street: string
  houseNumber: string
  residents: number
  roles: string[]
  isGuest: boolean
  deletedBy: string
  deletedAt: number
}

export interface BackupKindergartenEntry {
  id: string
  kindergartenName: string
  personName: string
  personType: string
  deletedBy: string
  deletedAt: number
}

export interface BackupClubEntry {
  id: string
  clubName: string
  personName: string
  personType: string
  deletedBy: string
  deletedAt: number
}

export interface EmergencyHistoryEntry {
  id: string
  residentName: string
  statusValue: string
  updatedBy: string
  createdAt: number
}

export interface BackupResidentEntry {
  id: string
  residentName: string
  deletedBy: string
  deletedAt: number
}

interface StoreState {
  currentUser: User | null
  users: User[]
  checkins: ShelterCheckin[]
  roles: string[]
  setCurrentUser: (user: User | null) => void
  addUser: (user: User) => Promise<User>
  updateUser: (user: User) => void
  updateUserRoles: (userId: string, roles: string[]) => void
  addCheckin: (checkin: ShelterCheckin) => void
  addRole: (role: string) => void
  removeRole: (role: string) => void
  getShelterCheckins: (shelterId: string) => ShelterCheckin[]
  getShelterPeopleCount: (shelterId: string) => number
  getUserCheckin: (userId: string) => ShelterCheckin | undefined
  lastCheckinUserId: string | null
  deleteUser: (userId: string) => void
  removeCheckin: (userId: string) => void
  clearAllCheckins: (saveToHistory?: boolean) => void
  clearShelterCheckins: (shelterId: string) => void
  distressAlerts: DistressAlert[]
  addDistressAlert: (alert: DistressAlert) => void
  deleteDistressAlert: (id: string) => void
  clearAllDistressAlerts: () => void
  issueReports: ShelterIssueReport[]
  addIssueReport: (report: ShelterIssueReport) => void
  removeIssue: (reportId: string, issue: string) => void
  getShelterIssues: (shelterId: string) => ShelterIssueReport | undefined
  clearAllIssueReports: () => void
  kindergartenAttendance: KindergartenAttendance[]
  setKindergartenAttendance: (attendance: KindergartenAttendance) => void
  getKindergartenAttendance: (kindergartenId: string) => KindergartenAttendance | undefined
  shelterHistory: ShelterDailySnapshot[]
  removeShelterHistory: (snapshotId: string) => void
  kindergartenHistory: KindergartenDailySnapshot[]
  saveKindergartenSnapshot: (snapshot: KindergartenDailySnapshot) => void
  checkinHistory: CheckinHistoryEntry[]
  issueHistory: IssueHistoryEntry[]
  distressHistory: DistressHistoryEntry[]
  clearUserCheckinHistory: (userId: string) => void
  backupUsers: BackupUser[]
  backupKindergartens: BackupKindergartenEntry[]
  backupClubs: BackupClubEntry[]
  restoreUser: (backupId: string) => Promise<void>
  permanentDeleteUser: (backupId: string) => Promise<void>
  addBackupKindergarten: (entry: { kindergartenName: string; personName: string; personType: string; deletedBy: string }) => Promise<void>
  addBackupClub: (entry: { clubName: string; personName: string; personType: string; deletedBy: string }) => Promise<void>
  restoreKindergarten: (backupId: string) => Promise<void>
  permanentDeleteKindergarten: (backupId: string) => Promise<void>
  restoreClub: (backupId: string) => Promise<void>
  permanentDeleteClub: (backupId: string) => Promise<void>
  emergencyHistory: EmergencyHistoryEntry[]
  backupResidents: BackupResidentEntry[]
  addBackupResident: (name: string, deletedBy: string) => Promise<void>
  restoreResident: (backupId: string) => Promise<void>
  permanentDeleteResident: (backupId: string) => Promise<void>
  clubAttendance: KindergartenAttendance[]
  setClubAttendance: (attendance: KindergartenAttendance) => void
  getClubAttendance: (clubId: string) => KindergartenAttendance | undefined
  clubHistory: KindergartenDailySnapshot[]
  emergencyStatuses: ResidentEmergencyStatus[]
  setResidentStatus: (status: ResidentEmergencyStatus) => void
  getResidentStatus: (residentId: string) => ResidentEmergencyStatus | undefined
  clearAllEmergencyStatuses: () => void
  removeResidentStatus: (residentId: string) => void
}

const DEFAULT_ROLES = ['USR', 'ADMIN', 'מנהל מקלט', 'גננת', 'מועדונים']

const StoreContext = createContext<StoreState | null>(null)

// --- DB <-> App mapping helpers ---

function dbUserToApp(row: any): User {
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    phone: row.phone,
    city: row.city,
    street: row.street,
    houseNumber: row.house_number,
    residents: row.residents,
    roles: row.roles,
    pin: undefined,
    isGuest: row.is_guest,
  }
}

function dbCheckinToApp(row: any): ShelterCheckin {
  return {
    id: row.id,
    shelterId: row.shelter_id,
    userId: row.user_id,
    userName: row.user_name,
    userPhone: row.user_phone,
    userHouseNumber: row.user_house_number,
    peopleCount: row.people_count,
    timestamp: new Date(row.created_at).getTime(),
    isGuest: row.is_guest,
    registeredBy: row.registered_by,
  }
}

function dbDistressToApp(row: any): DistressAlert {
  return {
    id: row.id,
    userId: row.user_id,
    userName: row.user_name,
    userPhone: row.user_phone,
    userHouseNumber: row.user_house_number,
    type: row.type,
    timestamp: new Date(row.created_at).getTime(),
  }
}

function dbIssueToApp(row: any): ShelterIssueReport {
  return {
    id: row.id,
    shelterId: row.shelter_id,
    shelterName: row.shelter_name,
    issues: row.issues,
    reportedBy: row.reported_by,
    timestamp: new Date(row.created_at).getTime(),
  }
}

function dbEmergencyToApp(row: any): ResidentEmergencyStatus {
  return {
    residentId: row.resident_id,
    status: row.status,
    updatedBy: row.updated_by,
    updatedAt: new Date(row.updated_at).getTime(),
  }
}

function dbBackupUserToApp(row: any): BackupUser {
  return {
    id: row.id,
    originalId: row.original_id,
    email: row.email,
    fullName: row.full_name,
    phone: row.phone,
    city: row.city,
    street: row.street,
    houseNumber: row.house_number,
    residents: row.residents,
    roles: row.roles,
    isGuest: row.is_guest,
    deletedBy: row.deleted_by,
    deletedAt: new Date(row.deleted_at).getTime(),
  }
}

function dbBackupKindergartenToApp(row: any): BackupKindergartenEntry {
  return {
    id: row.id,
    kindergartenName: row.kindergarten_name,
    personName: row.person_name,
    personType: row.person_type,
    deletedBy: row.deleted_by,
    deletedAt: new Date(row.deleted_at).getTime(),
  }
}

function dbBackupClubToApp(row: any): BackupClubEntry {
  return {
    id: row.id,
    clubName: row.club_name,
    personName: row.person_name,
    personType: row.person_type,
    deletedBy: row.deleted_by,
    deletedAt: new Date(row.deleted_at).getTime(),
  }
}

function dbEmergencyHistoryToApp(row: any): EmergencyHistoryEntry {
  return {
    id: row.id,
    residentName: row.resident_name,
    statusValue: row.status_value,
    updatedBy: row.updated_by,
    createdAt: new Date(row.created_at).getTime(),
  }
}

function dbBackupResidentToApp(row: any): BackupResidentEntry {
  return {
    id: row.id,
    residentName: row.resident_name,
    deletedBy: row.deleted_by,
    deletedAt: new Date(row.deleted_at).getTime(),
  }
}

function dbHistoryDistressToApp(row: any): DistressHistoryEntry {
  return {
    id: row.id,
    userName: row.user_name,
    userPhone: row.user_phone,
    userHouseNumber: row.user_house_number,
    type: row.distress_type as DistressType,
    timestamp: row.original_timestamp ? new Date(row.original_timestamp).getTime() : new Date(row.created_at).getTime(),
    deletedBy: row.deleted_by,
    deletedAt: new Date(row.created_at).getTime(),
  }
}

function dbHistoryIssueToApp(row: any): IssueHistoryEntry {
  return {
    id: row.id,
    shelterId: row.shelter_id,
    shelterName: row.shelter_name,
    issue: row.issue,
    reportedBy: row.reported_by,
    reportedAt: row.reported_at ? new Date(row.reported_at).getTime() : new Date(row.created_at).getTime(),
    resolvedBy: row.resolved_by,
    resolvedAt: new Date(row.created_at).getTime(),
  }
}

function dbKindergartenToApp(row: any): KindergartenAttendance {
  return {
    kindergartenId: row.kindergarten_id,
    presentChildren: row.present_children,
    reportedBy: row.reported_by,
    timestamp: new Date(row.created_at).getTime(),
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUserRaw] = useState<User | null>(() => {
    try {
      return JSON.parse(localStorage.getItem('currentUser') || 'null')
    } catch { return null }
  })
  const setCurrentUser = useCallback((user: User | null) => {
    setCurrentUserRaw(user)
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user))
    } else {
      localStorage.removeItem('currentUser')
      localStorage.removeItem('sessionTimestamp')
    }
  }, [])
  const [users, setUsers] = useState<User[]>([])
  const [checkins, setCheckins] = useState<ShelterCheckin[]>([])
  const [lastCheckinUserId, setLastCheckinUserId] = useState<string | null>(() => localStorage.getItem('lastCheckinUserId'))
  const [roles, setRoles] = useState<string[]>(DEFAULT_ROLES)
  const [distressAlerts, setDistressAlerts] = useState<DistressAlert[]>([])
  const [issueReports, setIssueReports] = useState<ShelterIssueReport[]>([])
  const [kindergartenAttendance, setKindergartenAttendanceState] = useState<KindergartenAttendance[]>([])
  const [emergencyStatuses, setEmergencyStatuses] = useState<ResidentEmergencyStatus[]>([])
  const [shelterHistory, setShelterHistory] = useState<ShelterDailySnapshot[]>([])
  const removeShelterHistory = useCallback((snapshotId: string) => {
    setShelterHistory(prev => prev.filter(s => s.id !== snapshotId))
  }, [])
  const [kindergartenHistory, setKindergartenHistory] = useState<KindergartenDailySnapshot[]>([])
  const [checkinHistory, setCheckinHistory] = useState<CheckinHistoryEntry[]>([])
  const [issueHistory, setIssueHistory] = useState<IssueHistoryEntry[]>([])
  const [distressHistory, setDistressHistory] = useState<DistressHistoryEntry[]>([])
  const [clubAttendance, setClubAttendanceState] = useState<KindergartenAttendance[]>([])
  const [clubHistory, setClubHistory] = useState<KindergartenDailySnapshot[]>([])
  const [backupUsers, setBackupUsers] = useState<BackupUser[]>([])
  const [backupKindergartens, setBackupKindergartens] = useState<BackupKindergartenEntry[]>([])
  const [backupClubs, setBackupClubs] = useState<BackupClubEntry[]>([])
  const [emergencyHistory, setEmergencyHistory] = useState<EmergencyHistoryEntry[]>([])
  const [backupResidents, setBackupResidents] = useState<BackupResidentEntry[]>([])

  // --- Load data from Supabase on mount ---
  useEffect(() => {
    supabase.from('users').select('id,email,full_name,phone,city,street,house_number,residents,roles,is_guest,created_at').then(({ data, error }) => {
      if (data && data.length > 0) setUsers(data.map(dbUserToApp))
      if (error) console.error('Failed to load users:', error)
    })
    supabase.from('checkins').select('*').then(({ data, error }) => {
      if (data) setCheckins(data.map(dbCheckinToApp))
      if (error) console.error('Failed to load checkins:', error)
    })
    supabase.from('distress_alerts').select('*').then(({ data }) => {
      if (data) setDistressAlerts(data.map(dbDistressToApp))
    })
    supabase.from('issue_reports').select('*').then(({ data }) => {
      if (data) setIssueReports(data.map(dbIssueToApp))
    })
    supabase.from('kindergarten_attendance').select('*').then(({ data }) => {
      if (data) setKindergartenAttendanceState(data.map(dbKindergartenToApp))
    })
    supabase.from('emergency_statuses').select('*').then(({ data }) => {
      if (data) setEmergencyStatuses(data.map(dbEmergencyToApp))
    })
    // Load backup tables
    supabase.from('backup_users').select('*').order('deleted_at', { ascending: false }).then(({ data }) => {
      if (data) setBackupUsers(data.map(dbBackupUserToApp))
    })
    supabase.from('backup_kindergartens').select('*').order('deleted_at', { ascending: false }).then(({ data }) => {
      if (data) setBackupKindergartens(data.map(dbBackupKindergartenToApp))
    })
    supabase.from('backup_clubs').select('*').order('deleted_at', { ascending: false }).then(({ data }) => {
      if (data) setBackupClubs(data.map(dbBackupClubToApp))
    })
    // Load source data (kindergartens/clubs) from DB
    import('./sourceData').then(({ loadSourceKindergartensFromDB, loadSourceClubsFromDB, loadSourceSheltersFromDB, loadSourceResidentsFromDB, loadSourceIssuesFromDB }) => {
      loadSourceKindergartensFromDB()
      loadSourceClubsFromDB()
      loadSourceSheltersFromDB()
      loadSourceResidentsFromDB()
      loadSourceIssuesFromDB()
    })
    // Load history tables
    supabase.from('history_shelters').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      if (data) {
        // Each DB row contains snapshot_data with multiple shelters
        // Expand into per-shelter snapshots for calendar view
        const snapshots: ShelterDailySnapshot[] = []
        data.forEach(row => {
          let snapshotData = row.snapshot_data as any
          if (typeof snapshotData === 'string') { try { snapshotData = JSON.parse(snapshotData) } catch { return } }
          const date = new Date(row.created_at).toISOString().split('T')[0]
          if (snapshotData && Array.isArray(snapshotData)) {
            snapshotData.forEach((s: any) => {
              if (s.checkins && s.checkins.length > 0) {
                snapshots.push({
                  id: row.id + '_' + s.shelterId,
                  shelterId: s.shelterId,
                  shelterName: s.shelterName || s.shelterId,
                  date,
                  checkins: s.checkins,
                  timestamp: new Date(row.created_at).getTime(),
                })
              }
            })
          }
        })
        setShelterHistory(snapshots)
      }
    })
    supabase.from('history_distress').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      if (data) setDistressHistory(data.map(dbHistoryDistressToApp))
    })
    supabase.from('history_issues').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      if (data) setIssueHistory(data.map(dbHistoryIssueToApp))
    })
    supabase.from('history_emergency').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      if (data) setEmergencyHistory(data.map(dbEmergencyHistoryToApp))
    })
    supabase.from('backup_residents').select('*').order('deleted_at', { ascending: false }).then(({ data }) => {
      if (data) setBackupResidents(data.map(dbBackupResidentToApp))
    })

    // Poll checkins every 5 seconds for cross-device sync
    const pollCheckins = setInterval(() => {
      supabase.from('checkins').select('*').then(({ data }) => {
        if (data) setCheckins(data.map(dbCheckinToApp))
      })
    }, 5000)
    return () => clearInterval(pollCheckins)
  }, [])

  // --- Users ---

  const addUser = useCallback(async (user: User) => {
    const { data } = await supabase.rpc('secure_add_user', {
      p_email: user.email,
      p_full_name: user.fullName,
      p_phone: user.phone,
      p_city: user.city,
      p_street: user.street,
      p_house_number: user.houseNumber,
      p_residents: user.residents,
      p_roles: user.roles,
      p_pin: user.pin || '',
      p_is_guest: user.isGuest || false,
      p_client_ip: '',
    })
    if (data?.success && data.user) {
      const appUser = dbUserToApp(data.user)
      setUsers(prev => [...prev, appUser])
      return appUser
    }
    if (data?.success === false) {
      if (data.error === 'ip_limited') {
        alert('הגעת למגבלת הרישומים. פנה למנהל המערכת.')
      }
      console.error('addUser denied:', data.error)
    }
    setUsers(prev => [...prev, user])
    return user
  }, [])

  const updateUser = useCallback(async (user: User) => {
    await safeRpc('secure_update_user', {
      caller_id: currentUser?.id || user.id,
      target_id: user.id,
      p_email: user.email,
      p_full_name: user.fullName,
      p_phone: user.phone,
      p_city: user.city,
      p_street: user.street,
      p_house_number: user.houseNumber,
      p_residents: user.residents,
      p_roles: user.roles,
      p_is_guest: user.isGuest || false,
      p_pin: user.pin || null,
    })
    setUsers(prev => prev.map(u => u.id === user.id ? user : u))
  }, [currentUser])

  const deleteUser = useCallback(async (userId: string) => {
    const { data } = await supabase.rpc('secure_backup_and_delete_user', {
      caller_id: currentUser?.id,
      target_user_id: userId,
    })
    if (data?.success === false) { console.error('deleteUser denied:', data.error); return }
    if (data?.backup) {
      setBackupUsers(prev => [dbBackupUserToApp(data.backup), ...prev])
    }
    setUsers(prev => prev.filter(u => u.id !== userId))
    setCheckins(prev => prev.filter(c => c.userId !== userId))
    if (currentUser?.id === userId) setCurrentUser(null)
  }, [currentUser])

  const restoreUser = useCallback(async (backupId: string) => {
    const { data } = await supabase.rpc('secure_restore_user', {
      caller_id: currentUser?.id,
      p_backup_id: backupId,
    })
    if (data?.success === false) { console.error('restoreUser denied:', data.error); return }
    if (data?.user) {
      setUsers(prev => [...prev, dbUserToApp(data.user)])
      setBackupUsers(prev => prev.filter(b => b.id !== backupId))
    }
  }, [currentUser])

  const permanentDeleteUser = useCallback(async (backupId: string) => {
    const { data } = await supabase.rpc('secure_permanent_delete_user', {
      caller_id: currentUser?.id,
      p_backup_id: backupId,
    })
    if (data?.success === false) { console.error('permanentDeleteUser denied:', data.error); return }
    setBackupUsers(prev => prev.filter(b => b.id !== backupId))
  }, [currentUser])

  const updateUserRoles = useCallback(async (userId: string, newRoles: string[]) => {
    await safeRpc('update_roles', { caller_id: currentUser?.id, target_user_id: userId, new_roles: newRoles })
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, roles: newRoles } : u))
    setCurrentUser(currentUser && currentUser.id === userId ? { ...currentUser, roles: newRoles } : currentUser)
  }, [currentUser])

  // --- Checkins ---

  const addCheckin = useCallback(async (checkin: ShelterCheckin) => {
    setLastCheckinUserId(checkin.userId)
    localStorage.setItem('lastCheckinUserId', checkin.userId)

    const data = await safeRpc('secure_add_checkin', {
      caller_id: checkin.userId,
      p_shelter_id: checkin.shelterId,
      p_user_id: checkin.userId,
      p_user_name: checkin.userName,
      p_user_phone: checkin.userPhone,
      p_user_house_number: checkin.userHouseNumber,
      p_people_count: checkin.peopleCount,
      p_is_guest: checkin.isGuest || false,
      p_registered_by: checkin.registeredBy || null,
    })

    if (data?.success && data.checkin) {
      setCheckins(prev => {
        const filtered = prev.filter(c => c.userId !== checkin.userId)
        return [...filtered, dbCheckinToApp(data.checkin)]
      })
    } else {
      setCheckins(prev => {
        const filtered = prev.filter(c => c.userId !== checkin.userId)
        return [...filtered, checkin]
      })
    }

    // Local history (kept in memory)
    setCheckinHistory(h => [...h, {
      id: Date.now().toString(),
      shelterId: checkin.shelterId,
      shelterName: checkin.shelterId,
      userId: checkin.userId,
      userName: checkin.userName,
      userPhone: checkin.userPhone,
      userHouseNumber: checkin.userHouseNumber,
      peopleCount: checkin.peopleCount,
      checkinTime: Date.now(),
      isGuest: checkin.isGuest,
    }])
  }, [])

  const removeCheckin = useCallback(async (userId: string) => {
    await safeRpc('secure_remove_checkin', {
      caller_id: currentUser?.id || userId,
      p_user_id: userId,
    })
    setCheckins(prev => prev.filter(c => c.userId !== userId))
    setLastCheckinUserId(prev => {
      if (prev === userId) { localStorage.removeItem('lastCheckinUserId'); return null }
      return prev
    })
  }, [currentUser])

  const clearAllCheckins = useCallback(async (saveToHistory: boolean = true) => {
    // Save snapshot to history before clearing
    if (saveToHistory && checkins.length > 0) {
      const { getSheltersWithSourceData } = await import('../data/shelters')
      const allShelters = getSheltersWithSourceData()
      const shelterMap: Record<string, { shelterId: string; shelterName: string; checkins: any[] }> = {}
      checkins.forEach(c => {
        if (!shelterMap[c.shelterId]) {
          const shelter = allShelters.find(s => s.id === c.shelterId)
          shelterMap[c.shelterId] = { shelterId: c.shelterId, shelterName: shelter?.name || c.shelterId, checkins: [] }
        }
        shelterMap[c.shelterId].checkins.push({
          userName: c.userName,
          userPhone: c.userPhone,
          userHouseNumber: c.userHouseNumber,
          peopleCount: c.peopleCount,
          isGuest: c.isGuest,
        })
      })
      const snapshotData = Object.values(shelterMap)
      const totalPeople = checkins.reduce((sum, c) => sum + c.peopleCount, 0)
      const { data: histData } = await supabase.rpc('secure_save_shelter_history', {
        caller_id: currentUser?.id,
        p_snapshot_data: snapshotData,
        p_total_people: totalPeople,
      })
      if (histData?.success && histData.history) {
        const date = new Date(histData.history.created_at).toISOString().split('T')[0]
        const newSnapshots: ShelterDailySnapshot[] = snapshotData
          .filter(s => s.checkins.length > 0)
          .map(s => ({
            id: histData.history.id + '_' + s.shelterId,
            shelterId: s.shelterId,
            date,
            checkins: s.checkins,
            timestamp: new Date(histData.history.created_at).getTime(),
          }))
        setShelterHistory(prev => [...newSnapshots, ...prev])
      }
    }
    const { data } = await supabase.rpc('secure_clear_all_checkins', { caller_id: currentUser?.id })
    if (data?.success === false) { console.error('clearAllCheckins denied:', data.error); return }
    setCheckins([])
  }, [currentUser, checkins])

  const clearShelterCheckins = useCallback(async (shelterId: string) => {
    const { data } = await supabase.rpc('secure_clear_shelter_checkins', { caller_id: currentUser?.id, p_shelter_id: shelterId })
    if (data?.success === false) { console.error('clearShelterCheckins denied:', data.error); return }
    setCheckins(prev => prev.filter(c => c.shelterId !== shelterId))
  }, [currentUser])

  // --- Roles ---

  const addRole = useCallback((role: string) => {
    setRoles(prev => prev.includes(role) ? prev : [...prev, role])
  }, [])

  const removeRole = useCallback((role: string) => {
    if (role === 'USR' || role === 'ADMIN') return
    setRoles(prev => prev.filter(r => r !== role))
    setUsers(prev => prev.map(u => ({ ...u, roles: u.roles.filter(r => r !== role) })))
  }, [])

  // --- Getters ---

  const getShelterCheckins = useCallback((shelterId: string) => {
    return checkins.filter(c => c.shelterId === shelterId)
  }, [checkins])

  const getShelterPeopleCount = useCallback((shelterId: string) => {
    return checkins.filter(c => c.shelterId === shelterId).reduce((sum, c) => sum + c.peopleCount, 0)
  }, [checkins])

  const getUserCheckin = useCallback((userId: string) => {
    return checkins.find(c => c.userId === userId)
  }, [checkins])

  // --- Distress Alerts ---

  const addDistressAlert = useCallback(async (alert: DistressAlert) => {
    const { data } = await supabase.rpc('secure_add_distress', {
      caller_id: alert.userId,
      p_user_id: alert.userId,
      p_user_name: alert.userName,
      p_user_phone: alert.userPhone,
      p_user_house_number: alert.userHouseNumber,
      p_type: alert.type,
    })
    if (data?.success && data.alert) {
      setDistressAlerts(prev => [...prev, dbDistressToApp(data.alert)])
    } else {
      setDistressAlerts(prev => [...prev, alert])
    }
  }, [])

  const deleteDistressAlert = useCallback(async (id: string) => {
    const alert = distressAlerts.find(a => a.id === id)
    if (alert) {
      const { data: histData } = await supabase.rpc('secure_save_distress_history', {
        caller_id: currentUser?.id,
        p_user_name: alert.userName,
        p_user_phone: alert.userPhone,
        p_user_house_number: alert.userHouseNumber,
        p_distress_type: alert.type,
        p_original_timestamp: new Date(alert.timestamp).toISOString(),
        p_deleted_by: currentUser?.fullName ?? 'unknown',
      })
      if (histData?.success && histData.history) {
        setDistressHistory(h => [dbHistoryDistressToApp(histData.history), ...h])
      }
    }
    const { data } = await supabase.rpc('secure_delete_distress', { caller_id: currentUser?.id, alert_id: id })
    if (data?.success === false) { console.error('deleteDistressAlert denied:', data.error); return }
    setDistressAlerts(prev => prev.filter(a => a.id !== id))
  }, [distressAlerts, currentUser])

  const clearAllDistressAlerts = useCallback(async () => {
    // Save all to history DB via RPC
    for (const alert of distressAlerts) {
      const { data: histData } = await supabase.rpc('secure_save_distress_history', {
        caller_id: currentUser?.id,
        p_user_name: alert.userName,
        p_user_phone: alert.userPhone,
        p_user_house_number: alert.userHouseNumber,
        p_distress_type: alert.type,
        p_original_timestamp: new Date(alert.timestamp).toISOString(),
        p_deleted_by: currentUser?.fullName ?? 'unknown',
      })
      if (histData?.success && histData.history) {
        setDistressHistory(h => [dbHistoryDistressToApp(histData.history), ...h])
      }
    }
    const { data } = await supabase.rpc('secure_clear_all_distress', { caller_id: currentUser?.id })
    if (data?.success === false) { console.error('clearAllDistressAlerts denied:', data.error); return }
    setDistressAlerts([])
  }, [distressAlerts, currentUser])

  // --- Issue Reports ---

  const addIssueReport = useCallback(async (report: ShelterIssueReport) => {
    const { data } = await supabase.rpc('secure_add_issue_report', {
      caller_id: currentUser?.id || 'unknown',
      p_shelter_id: report.shelterId,
      p_shelter_name: report.shelterName,
      p_issues: report.issues,
      p_reported_by: report.reportedBy,
    })
    if (data?.success && data.report) {
      setIssueReports(prev => {
        const filtered = prev.filter(r => r.shelterId !== report.shelterId)
        return [...filtered, dbIssueToApp(data.report)]
      })
    } else {
      setIssueReports(prev => {
        const filtered = prev.filter(r => r.shelterId !== report.shelterId)
        return [...filtered, report]
      })
    }
  }, [currentUser])

  const removeIssue = useCallback(async (reportId: string, issue: string) => {
    const { data } = await supabase.rpc('secure_remove_issue', {
      caller_id: currentUser?.id || 'unknown',
      p_report_id: reportId,
      p_issue: issue,
    })
    if (data?.success && data.history) {
      setIssueHistory(h => [dbHistoryIssueToApp(data.history), ...h])
    }
    setIssueReports(prev => prev.map(r => {
      if (r.id !== reportId) return r
      return { ...r, issues: r.issues.filter(i => i !== issue) }
    }).filter(r => r.issues.length > 0))
  }, [currentUser])

  const getShelterIssues = useCallback((shelterId: string) => {
    return issueReports.find(r => r.shelterId === shelterId)
  }, [issueReports])

  const clearAllIssueReports = useCallback(async () => {
    const { data } = await supabase.rpc('secure_clear_all_issues', {
      caller_id: currentUser?.id || 'unknown',
    })
    if (data?.success === false) { console.error('clearAllIssueReports denied:', data.error); return }
    // The RPC saved all issues to history server-side, reload history
    const { data: histRows } = await supabase.from('history_issues').select('*').order('created_at', { ascending: false })
    if (histRows) setIssueHistory(histRows.map(dbHistoryIssueToApp))
    setIssueReports([])
  }, [currentUser])

  // --- Kindergarten Attendance ---

  const setKindergartenAttendance = useCallback(async (attendance: KindergartenAttendance) => {
    await safeRpc('secure_set_kindergarten_attendance', {
      caller_id: currentUser?.id || 'unknown',
      p_kindergarten_id: attendance.kindergartenId,
      p_present_children: attendance.presentChildren,
      p_reported_by: attendance.reportedBy,
    })
    setKindergartenAttendanceState(prev => {
      const filtered = prev.filter(a => a.kindergartenId !== attendance.kindergartenId)
      return [...filtered, attendance]
    })
    if (attendance.presentChildren.length > 0) {
      const today = new Date().toISOString().split('T')[0]
      setKindergartenHistory(prev => {
        const filtered = prev.filter(s => !(s.kindergartenId === attendance.kindergartenId && s.date === today))
        return [...filtered, {
          id: Date.now().toString(),
          kindergartenId: attendance.kindergartenId,
          date: today,
          presentChildren: attendance.presentChildren,
          reportedBy: attendance.reportedBy,
          timestamp: Date.now(),
        }]
      })
    }
  }, [currentUser])

  const getKindergartenAttendance = useCallback((kindergartenId: string) => {
    return kindergartenAttendance.find(a => a.kindergartenId === kindergartenId)
  }, [kindergartenAttendance])

  const saveKindergartenSnapshot = useCallback((snapshot: KindergartenDailySnapshot) => {
    setKindergartenHistory(prev => {
      const filtered = prev.filter(s => !(s.kindergartenId === snapshot.kindergartenId && s.date === snapshot.date))
      return [...filtered, snapshot]
    })
  }, [])

  // --- Emergency Statuses ---

  const setResidentStatus = useCallback(async (status: ResidentEmergencyStatus) => {
    await safeRpc('secure_set_resident_status', {
      caller_id: currentUser?.id || 'unknown',
      p_resident_id: status.residentId,
      p_status: status.status,
      p_updated_by: status.updatedBy,
      p_updated_at: new Date(status.updatedAt).toISOString(),
    })
    setEmergencyStatuses(prev => {
      const filtered = prev.filter(s => s.residentId !== status.residentId)
      return [...filtered, status]
    })
    // Save to emergency history
    const statusLabel = EMERGENCY_STATUS_LABELS[status.status] || status.status
    const { data: histRow } = await supabase.from('history_emergency').insert({
      resident_name: status.residentId,
      status_value: statusLabel,
      updated_by: status.updatedBy,
    }).select().single()
    if (histRow) {
      setEmergencyHistory(prev => [dbEmergencyHistoryToApp(histRow), ...prev])
    }
  }, [currentUser])

  const getResidentStatus = useCallback((residentId: string) => {
    return emergencyStatuses.find(s => s.residentId === residentId)
  }, [emergencyStatuses])

  const clearAllEmergencyStatuses = useCallback(async () => {
    const { data } = await supabase.rpc('secure_clear_all_emergency', {
      caller_id: currentUser?.id || 'unknown',
    })
    if (data?.success === false) { console.error('clearAllEmergencyStatuses denied:', data.error); return }
    setEmergencyStatuses([])
  }, [currentUser])

  const removeResidentStatus = useCallback(async (residentId: string) => {
    await safeRpc('secure_remove_resident_status', {
      caller_id: currentUser?.id || 'unknown',
      p_resident_id: residentId,
    })
    setEmergencyStatuses(prev => prev.filter(s => s.residentId !== residentId))
  }, [currentUser])

  // --- Clubs (local only for now) ---

  const setClubAttendance = useCallback(async (attendance: KindergartenAttendance) => {
    await safeRpc('secure_set_club_attendance', {
      caller_id: currentUser?.id || 'unknown',
      p_club_id: attendance.kindergartenId,
      p_present_children: attendance.presentChildren,
      p_reported_by: attendance.reportedBy,
    })
    setClubAttendanceState(prev => {
      const filtered = prev.filter(a => a.kindergartenId !== attendance.kindergartenId)
      return [...filtered, attendance]
    })
    if (attendance.presentChildren.length > 0) {
      const today = new Date().toISOString().split('T')[0]
      setClubHistory(prev => {
        const filtered = prev.filter(s => !(s.kindergartenId === attendance.kindergartenId && s.date === today))
        return [...filtered, {
          id: Date.now().toString(),
          kindergartenId: attendance.kindergartenId,
          date: today,
          presentChildren: attendance.presentChildren,
          reportedBy: attendance.reportedBy,
          timestamp: Date.now(),
        }]
      })
    }
  }, [currentUser])

  const getClubAttendance = useCallback((clubId: string) => {
    return clubAttendance.find(a => a.kindergartenId === clubId)
  }, [clubAttendance])

  const clearUserCheckinHistory = useCallback((userId: string) => {
    setCheckinHistory(prev => prev.filter(h => h.userId !== userId))
  }, [])

  // --- Backup Kindergartens ---

  const addBackupKindergarten = useCallback(async (entry: { kindergartenName: string; personName: string; personType: string; deletedBy: string }) => {
    const { data } = await supabase.rpc('secure_add_backup_kg', {
      caller_id: currentUser?.id || 'unknown',
      p_kg_name: entry.kindergartenName,
      p_person_name: entry.personName,
      p_person_type: entry.personType,
      p_deleted_by: entry.deletedBy,
    })
    if (data?.success && data.backup) {
      setBackupKindergartens(prev => [dbBackupKindergartenToApp(data.backup), ...prev])
    }
  }, [currentUser])

  const restoreKindergarten = useCallback(async (backupId: string) => {
    const { data } = await supabase.rpc('secure_restore_kg', {
      caller_id: currentUser?.id || 'unknown',
      p_backup_id: backupId,
    })
    if (data?.success === false) { console.error('restoreKindergarten failed:', data.error); return }
    if (data?.backup) {
      // Restore to sourceData localStorage
      const raw = localStorage.getItem('source_kindergartens')
      if (raw) {
        const kgs = JSON.parse(raw)
        const kg = kgs.find((k: any) => k.name === data.backup.kindergarten_name)
        if (kg) {
          if (data.backup.person_type === 'child' && !kg.children.includes(data.backup.person_name)) {
            kg.children.push(data.backup.person_name)
          } else if (data.backup.person_type === 'staff' && !kg.staff.includes(data.backup.person_name)) {
            kg.staff.push(data.backup.person_name)
          }
          localStorage.setItem('source_kindergartens', JSON.stringify(kgs))
        }
      }
      setBackupKindergartens(prev => prev.filter(b => b.id !== backupId))
    }
  }, [currentUser])

  const permanentDeleteKindergarten = useCallback(async (backupId: string) => {
    await safeRpc('secure_delete_backup_kg', {
      caller_id: currentUser?.id || 'unknown',
      p_backup_id: backupId,
    })
    setBackupKindergartens(prev => prev.filter(b => b.id !== backupId))
  }, [currentUser])

  // --- Backup Clubs ---

  const addBackupClub = useCallback(async (entry: { clubName: string; personName: string; personType: string; deletedBy: string }) => {
    const { data } = await supabase.rpc('secure_add_backup_club', {
      caller_id: currentUser?.id || 'unknown',
      p_club_name: entry.clubName,
      p_person_name: entry.personName,
      p_person_type: entry.personType,
      p_deleted_by: entry.deletedBy,
    })
    if (data?.success && data.backup) {
      setBackupClubs(prev => [dbBackupClubToApp(data.backup), ...prev])
    }
  }, [currentUser])

  const restoreClub = useCallback(async (backupId: string) => {
    const { data } = await supabase.rpc('secure_restore_club', {
      caller_id: currentUser?.id || 'unknown',
      p_backup_id: backupId,
    })
    if (data?.success === false) { console.error('restoreClub failed:', data.error); return }
    if (data?.backup) {
      // Restore to sourceData localStorage
      const raw = localStorage.getItem('source_clubs')
      if (raw) {
        const clubs = JSON.parse(raw)
        const club = clubs.find((c: any) => c.name === data.backup.club_name)
        if (club) {
          if (data.backup.person_type === 'member' && !club.children.includes(data.backup.person_name)) {
            club.children.push(data.backup.person_name)
          } else if (data.backup.person_type === 'staff' && !club.staff.includes(data.backup.person_name)) {
            club.staff.push(data.backup.person_name)
          }
          localStorage.setItem('source_clubs', JSON.stringify(clubs))
        }
      }
      setBackupClubs(prev => prev.filter(b => b.id !== backupId))
    }
  }, [currentUser])

  const permanentDeleteClub = useCallback(async (backupId: string) => {
    await safeRpc('secure_delete_backup_club', {
      caller_id: currentUser?.id || 'unknown',
      p_backup_id: backupId,
    })
    setBackupClubs(prev => prev.filter(b => b.id !== backupId))
  }, [currentUser])

  // --- Backup Residents ---

  const addBackupResident = useCallback(async (name: string, deletedBy: string) => {
    const { data: row } = await supabase.from('backup_residents').insert({
      resident_name: name,
      deleted_by: deletedBy,
    }).select().single()
    if (row) {
      setBackupResidents(prev => [dbBackupResidentToApp(row), ...prev])
    }
  }, [])

  const restoreResident = useCallback(async (backupId: string) => {
    const entry = backupResidents.find(b => b.id === backupId)
    if (!entry) return
    // Add back to source residents localStorage + DB
    const { getSourceResidents, saveSourceResidents, saveSourceResidentsToDB } = await import('./sourceData')
    const current = getSourceResidents()
    if (!current.includes(entry.residentName)) {
      const updated = [...current, entry.residentName].sort((a, b) => a.localeCompare(b, 'he'))
      saveSourceResidents(updated)
      if (currentUser?.id) saveSourceResidentsToDB(updated, currentUser.id)
    }
    // Remove from backup table
    await supabase.from('backup_residents').delete().eq('id', backupId)
    setBackupResidents(prev => prev.filter(b => b.id !== backupId))
  }, [currentUser, backupResidents])

  const permanentDeleteResident = useCallback(async (backupId: string) => {
    await supabase.from('backup_residents').delete().eq('id', backupId)
    setBackupResidents(prev => prev.filter(b => b.id !== backupId))
  }, [])

  return (
    <StoreContext.Provider value={{
      currentUser, setCurrentUser,
      users, addUser, updateUser, deleteUser, updateUserRoles,
      checkins, addCheckin,
      roles, addRole, removeRole,
      getShelterCheckins, getShelterPeopleCount,
      getUserCheckin, lastCheckinUserId, removeCheckin, clearAllCheckins, clearShelterCheckins,
      distressAlerts, addDistressAlert, deleteDistressAlert, clearAllDistressAlerts,
      issueReports, addIssueReport, removeIssue, getShelterIssues, clearAllIssueReports,
      kindergartenAttendance, setKindergartenAttendance, getKindergartenAttendance,
      shelterHistory, removeShelterHistory, kindergartenHistory, saveKindergartenSnapshot,
      emergencyStatuses, setResidentStatus, getResidentStatus, clearAllEmergencyStatuses, removeResidentStatus,
      clubAttendance, setClubAttendance, getClubAttendance, clubHistory,
      checkinHistory, issueHistory, distressHistory, clearUserCheckinHistory,
      backupUsers, backupKindergartens, backupClubs,
      restoreUser, permanentDeleteUser,
      addBackupKindergarten, addBackupClub,
      restoreKindergarten, permanentDeleteKindergarten,
      restoreClub, permanentDeleteClub,
      emergencyHistory,
      backupResidents, addBackupResident, restoreResident, permanentDeleteResident,
    }}>
      {children}
    </StoreContext.Provider>
  )
}

export function useStore(): StoreState {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}
