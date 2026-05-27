import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useStore } from '../data/store'
import { loadSchoolClassesFromDB, getSchoolClassesFromCache, getSchoolUsersFromCache } from '../data/sourceData'
import SchoolHome from './SchoolHome'

interface SchoolClass {
  name: string
  students: string[]
}

export default function SchoolClasses() {
  const { schoolId } = useParams<{ schoolId: string }>()
  const navigate = useNavigate()
  const { currentUser } = useStore()
  const [classes, setClasses] = useState<SchoolClass[]>(() => getSchoolClassesFromCache(schoolId || ''))
  const [selectedClass, setSelectedClass] = useState<string | null>(null)

  useEffect(() => {
    if (schoolId) loadSchoolClassesFromDB(schoolId).then(setClasses)
  }, [schoolId])

  // Check if user is סגל חינוכי (teacher) - auto-select their class
  useEffect(() => {
    if (!currentUser || !schoolId || classes.length === 0) return
    const schoolUsers = getSchoolUsersFromCache(schoolId)
    const me = schoolUsers.find((u: any) => u.email === currentUser.email || u.phone === currentUser.phone)
    const roles: string[] = me?.roles || []
    const isAdmin = currentUser.roles?.includes('ADMIN')
    const isManager = roles.includes('מנהלת') || roles.includes('מזכירות')
    if (!isAdmin && !isManager && roles.includes('סגל חינוכי') && me?.className) {
      setSelectedClass(me.className)
    }
  }, [currentUser, schoolId, classes])

  const isTeacherOnly = (() => {
    if (!currentUser || !schoolId) return false
    if (currentUser.roles?.includes('ADMIN')) return false
    const schoolUsers = getSchoolUsersFromCache(schoolId)
    const me = schoolUsers.find((u: any) => u.email === currentUser.email || u.phone === currentUser.phone)
    const roles: string[] = me?.roles || []
    return !roles.includes('מנהלת') && !roles.includes('מזכירות') && roles.includes('סגל חינוכי')
  })()

  // Teacher view - show two action squares directly
  if (selectedClass && isTeacherOnly) {
    const cls = classes.find(c => c.name === selectedClass)
    if (!cls) return <SchoolHome content={<p style={{ textAlign: 'center', color: 'var(--color-text-secondary)' }}>כיתה לא נמצאה</p>} />
    return (
      <SchoolHome content={
        <>
          <p style={{ fontSize: '18px', fontWeight: 800, color: '#fff', textAlign: 'center', marginBottom: '4px' }}>
            כיתה {cls.name}
          </p>
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', textAlign: 'center', marginBottom: '24px' }}>
            {cls.students.length} תלמידים
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <button
              onClick={() => navigate(`/schools/${schoolId}/classes/${encodeURIComponent(cls.name)}/attendance`)}
              style={{
                width: '140px', padding: '28px 16px', background: 'var(--color-bg-card)',
                border: '1px solid var(--color-border)', borderRadius: 'var(--radius)',
                cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-success)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              <span style={{ fontSize: '40px', display: 'block', marginBottom: '8px' }}>✅</span>
              <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--color-success)' }}>נוכחות</span>
            </button>
            <button
              onClick={() => navigate(`/schools/${schoolId}/classes/${encodeURIComponent(cls.name)}/emergency`)}
              style={{
                width: '140px', padding: '28px 16px', background: 'var(--color-bg-card)',
                border: '1px solid var(--color-border)', borderRadius: 'var(--radius)',
                cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-danger)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              <span style={{ fontSize: '40px', display: 'block', marginBottom: '8px' }}>🚨</span>
              <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--color-danger)' }}>חירום</span>
            </button>
          </div>
        </>
      } />
    )
  }

  // Admin/manager view - class grid, click to select
  if (selectedClass) {
    const cls = classes.find(c => c.name === selectedClass)
    if (!cls) return null
    return (
      <SchoolHome content={
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <p style={{ fontSize: '18px', fontWeight: 800, color: '#fff', margin: 0 }}>
              כיתה {cls.name}
            </p>
            <button onClick={() => setSelectedClass(null)} style={{
              background: 'rgba(77, 166, 232, 0.15)', border: '1px solid var(--color-accent)',
              borderRadius: 'var(--radius-sm)', color: 'var(--color-accent)',
              cursor: 'pointer', fontSize: '13px', fontWeight: 700, padding: '8px 16px',
            }}>חזרה לכיתות</button>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', textAlign: 'center', marginBottom: '24px' }}>
            {cls.students.length} תלמידים
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <button
              onClick={() => navigate(`/schools/${schoolId}/classes/${encodeURIComponent(cls.name)}/attendance`)}
              style={{
                width: '140px', padding: '28px 16px', background: 'var(--color-bg-card)',
                border: '1px solid var(--color-border)', borderRadius: 'var(--radius)',
                cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-success)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              <span style={{ fontSize: '40px', display: 'block', marginBottom: '8px' }}>✅</span>
              <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--color-success)' }}>נוכחות</span>
            </button>
            <button
              onClick={() => navigate(`/schools/${schoolId}/classes/${encodeURIComponent(cls.name)}/emergency`)}
              style={{
                width: '140px', padding: '28px 16px', background: 'var(--color-bg-card)',
                border: '1px solid var(--color-border)', borderRadius: 'var(--radius)',
                cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-danger)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              <span style={{ fontSize: '40px', display: 'block', marginBottom: '8px' }}>🚨</span>
              <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--color-danger)' }}>חירום</span>
            </button>
          </div>
        </>
      } />
    )
  }

  return (
    <SchoolHome content={
      <>
        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', textAlign: 'center', marginBottom: '16px' }}>
          בחר כיתה
        </p>
        {classes.length > 0 ? (
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
            gap: '10px',
          }}>
            {classes.map(c => (
              <button
                key={c.name}
                onClick={() => setSelectedClass(c.name)}
                style={{
                  background: 'var(--color-bg-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius)',
                  padding: '16px 8px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-accent)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.transform = 'translateY(0)' }}
              >
                <p style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-accent)', margin: '0 0 4px', textShadow: '0 0 8px rgba(77, 166, 232, 0.6)' }}>
                  {c.name}
                </p>
                <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: 0 }}>
                  {c.students.length} תלמידים
                </p>
              </button>
            ))}
          </div>
        ) : (
          <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '13px' }}>
            אין כיתות - העלה אקסל בטבלאות מקור
          </p>
        )}
      </>
    } />
  )
}
