import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

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

interface StoreState {
  currentUser: User | null
  users: User[]
  checkins: ShelterCheckin[]
  roles: string[]
  setCurrentUser: (user: User | null) => void
  addUser: (user: User) => void
  updateUserRoles: (userId: string, roles: string[]) => void
  addCheckin: (checkin: ShelterCheckin) => void
  addRole: (role: string) => void
  removeRole: (role: string) => void
  getShelterCheckins: (shelterId: string) => ShelterCheckin[]
  getShelterPeopleCount: (shelterId: string) => number
  getUserCheckin: (userId: string) => ShelterCheckin | undefined
  clearAllCheckins: () => void
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
  checkinHistory: CheckinHistoryEntry[]
  issueHistory: IssueHistoryEntry[]
  distressHistory: DistressHistoryEntry[]
  clearUserCheckinHistory: (userId: string) => void
}

const DEFAULT_ROLES = ['USR', 'ADMIN', 'מנהל מקלט', 'גננת', 'מועדונים']

const StoreContext = createContext<StoreState | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [checkins, setCheckins] = useState<ShelterCheckin[]>([])
  const [roles, setRoles] = useState<string[]>(DEFAULT_ROLES)
  const [distressAlerts, setDistressAlerts] = useState<DistressAlert[]>([])
  const [issueReports, setIssueReports] = useState<ShelterIssueReport[]>([])
  const [kindergartenAttendance, setKindergartenAttendanceState] = useState<KindergartenAttendance[]>([])

  const setKindergartenAttendance = useCallback((attendance: KindergartenAttendance) => {
    setKindergartenAttendanceState(prev => {
      const filtered = prev.filter(a => a.kindergartenId !== attendance.kindergartenId)
      return [...filtered, attendance]
    })
  }, [])

  const getKindergartenAttendance = useCallback((kindergartenId: string) => {
    return kindergartenAttendance.find(a => a.kindergartenId === kindergartenId)
  }, [kindergartenAttendance])

  const [checkinHistory, setCheckinHistory] = useState<CheckinHistoryEntry[]>([])
  const [issueHistory, setIssueHistory] = useState<IssueHistoryEntry[]>([])
  const [distressHistory, setDistressHistory] = useState<DistressHistoryEntry[]>([])

  const addUser = useCallback((user: User) => {
    setUsers(prev => [...prev, user])
  }, [])

  const updateUserRoles = useCallback((userId: string, newRoles: string[]) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, roles: newRoles } : u))
    setCurrentUser(prev => prev && prev.id === userId ? { ...prev, roles: newRoles } : prev)
  }, [])

  const addCheckin = useCallback((checkin: ShelterCheckin) => {
    // Log to history
    setCheckinHistory(h => [...h, {
      id: Date.now().toString(),
      shelterId: checkin.shelterId,
      shelterName: checkin.shelterId, // will be resolved in display
      userId: checkin.userId,
      userName: checkin.userName,
      userPhone: checkin.userPhone,
      userHouseNumber: checkin.userHouseNumber,
      peopleCount: checkin.peopleCount,
      checkinTime: Date.now(),
      isGuest: checkin.isGuest,
    }])
    setCheckins(prev => {
      const filtered = prev.filter(c => c.userId !== checkin.userId)
      return [...filtered, checkin]
    })
  }, [])

  const addRole = useCallback((role: string) => {
    setRoles(prev => prev.includes(role) ? prev : [...prev, role])
  }, [])

  const removeRole = useCallback((role: string) => {
    if (role === 'USR' || role === 'ADMIN') return
    setRoles(prev => prev.filter(r => r !== role))
    setUsers(prev => prev.map(u => ({ ...u, roles: u.roles.filter(r => r !== role) })))
  }, [])

  const getShelterCheckins = useCallback((shelterId: string) => {
    return checkins.filter(c => c.shelterId === shelterId)
  }, [checkins])

  const getShelterPeopleCount = useCallback((shelterId: string) => {
    return checkins.filter(c => c.shelterId === shelterId).reduce((sum, c) => sum + c.peopleCount, 0)
  }, [checkins])

  const getUserCheckin = useCallback((userId: string) => {
    return checkins.find(c => c.userId === userId)
  }, [checkins])

  const clearAllCheckins = useCallback(() => {
    setCheckins([])
  }, [])

  const clearShelterCheckins = useCallback((shelterId: string) => {
    setCheckins(prev => prev.filter(c => c.shelterId !== shelterId))
  }, [])

  const addDistressAlert = useCallback((alert: DistressAlert) => {
    setDistressAlerts(prev => [...prev, alert])
  }, [])

  const deleteDistressAlert = useCallback((id: string) => {
    setDistressAlerts(prev => {
      const alert = prev.find(a => a.id === id)
      if (alert) {
        setDistressHistory(h => [...h, {
          id: Date.now().toString(),
          userName: alert.userName,
          userPhone: alert.userPhone,
          userHouseNumber: alert.userHouseNumber,
          type: alert.type,
          timestamp: alert.timestamp,
          deletedBy: currentUser?.fullName ?? 'מנהל',
          deletedAt: Date.now(),
        }])
      }
      return prev.filter(a => a.id !== id)
    })
  }, [currentUser])

  const clearAllDistressAlerts = useCallback(() => {
    setDistressAlerts(prev => {
      prev.forEach(alert => {
        setDistressHistory(h => [...h, {
          id: Date.now().toString() + alert.id,
          userName: alert.userName, userPhone: alert.userPhone,
          userHouseNumber: alert.userHouseNumber, type: alert.type,
          timestamp: alert.timestamp,
          deletedBy: currentUser?.fullName ?? 'מנהל', deletedAt: Date.now(),
        }])
      })
      return []
    })
  }, [currentUser])

  const addIssueReport = useCallback((report: ShelterIssueReport) => {
    setIssueReports(prev => {
      const filtered = prev.filter(r => r.shelterId !== report.shelterId)
      return [...filtered, report]
    })
  }, [])

  const removeIssue = useCallback((reportId: string, issue: string) => {
    setIssueReports(prev => {
      const report = prev.find(r => r.id === reportId)
      if (report) {
        setIssueHistory(h => [...h, {
          id: Date.now().toString(),
          shelterId: report.shelterId,
          shelterName: report.shelterName,
          issue,
          reportedBy: report.reportedBy,
          reportedAt: report.timestamp,
          resolvedBy: currentUser?.fullName ?? 'מנהל',
          resolvedAt: Date.now(),
        }])
      }
      return prev.map(r => {
        if (r.id !== reportId) return r
        const newIssues = r.issues.filter(i => i !== issue)
        return { ...r, issues: newIssues }
      }).filter(r => r.issues.length > 0)
    })
  }, [currentUser])

  const getShelterIssues = useCallback((shelterId: string) => {
    return issueReports.find(r => r.shelterId === shelterId)
  }, [issueReports])

  const clearUserCheckinHistory = useCallback((userId: string) => {
    setCheckinHistory(prev => prev.filter(h => h.userId !== userId))
  }, [])

  const clearAllIssueReports = useCallback(() => {
    setIssueReports(prev => {
      prev.forEach(report => {
        report.issues.forEach(issue => {
          setIssueHistory(h => [...h, {
            id: Date.now().toString() + issue,
            shelterId: report.shelterId, shelterName: report.shelterName,
            issue, reportedBy: report.reportedBy, reportedAt: report.timestamp,
            resolvedBy: currentUser?.fullName ?? 'מנהל', resolvedAt: Date.now(),
          }])
        })
      })
      return []
    })
  }, [currentUser])

  return (
    <StoreContext.Provider value={{
      currentUser, setCurrentUser,
      users, addUser, updateUserRoles,
      checkins, addCheckin,
      roles, addRole, removeRole,
      getShelterCheckins, getShelterPeopleCount,
      getUserCheckin, clearAllCheckins, clearShelterCheckins,
      distressAlerts, addDistressAlert, deleteDistressAlert, clearAllDistressAlerts,
      issueReports, addIssueReport, removeIssue, getShelterIssues, clearAllIssueReports,
      kindergartenAttendance, setKindergartenAttendance, getKindergartenAttendance,
      checkinHistory, issueHistory, distressHistory, clearUserCheckinHistory,
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
