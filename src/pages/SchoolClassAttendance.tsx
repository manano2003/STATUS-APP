import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useStore } from '../data/store'
import { loadSchoolClassesFromDB, getSchoolClassesFromCache, saveSchoolAttendanceToDB } from '../data/sourceData'
import SchoolHome from './SchoolHome'

export default function SchoolClassAttendance() {
  const { schoolId, className } = useParams<{ schoolId: string; className: string }>()
  const navigate = useNavigate()
  const { currentUser } = useStore()
  const decodedClassName = className ? decodeURIComponent(className) : ''

  const [students, setStudents] = useState<string[]>([])
  const [attendance, setAttendance] = useState<Record<string, boolean>>({})
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!schoolId) return
    const loadData = async () => {
      const classes = await loadSchoolClassesFromDB(schoolId) || getSchoolClassesFromCache(schoolId)
      const cls = classes.find(c => c.name === decodedClassName)
      if (cls) {
        setStudents(cls.students)
        // Default: all students present
        const defaultAttendance: Record<string, boolean> = {}
        cls.students.forEach(s => { defaultAttendance[s] = true })
        // Check if there's existing attendance for today
        const today = new Date().toISOString().split('T')[0]
        try {
          const existing = JSON.parse(localStorage.getItem(`school_attendance_${schoolId}_${decodedClassName}_${today}`) || '{}')
          if (Object.keys(existing).length > 0) {
            setAttendance(existing)
          } else {
            setAttendance(defaultAttendance)
          }
        } catch {
          setAttendance(defaultAttendance)
        }
      }
    }
    loadData()
  }, [schoolId, decodedClassName])

  const toggleStudent = (name: string) => {
    setAttendance(prev => ({ ...prev, [name]: !prev[name] }))
    setSaved(false)
  }

  const handleSave = async () => {
    if (!schoolId) return
    const today = new Date().toISOString().split('T')[0]
    await saveSchoolAttendanceToDB(schoolId, decodedClassName, today, attendance, currentUser?.id || '')
    setSaved(true)
    setTimeout(() => navigate(`/schools/${schoolId}/classes`), 1500)
  }

  const presentCount = Object.values(attendance).filter(v => v === true).length
  const absentCount = Object.values(attendance).filter(v => v === false).length

  return (
    <SchoolHome backTo={`/schools/${schoolId}/classes`} content={
      <>
        <p style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-accent)', textAlign: 'center', marginBottom: '4px' }}>
          נוכחות — כיתה {decodedClassName}
        </p>
        <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', textAlign: 'center', marginBottom: '16px' }}>
          <span style={{ color: 'var(--color-success)', fontWeight: 700 }}>{presentCount} נוכחים</span>
          {' | '}
          <span style={{ color: 'var(--color-danger)', fontWeight: 700 }}>{absentCount} חסרים</span>
        </p>

        {saved && (
          <div style={{
            background: 'rgba(77, 232, 138, 0.15)', border: '1px solid var(--color-success)',
            borderRadius: 'var(--radius)', padding: '12px', textAlign: 'center',
            marginBottom: '16px', fontSize: '14px', fontWeight: 700, color: 'var(--color-success)',
          }}>
            הנוכחות נשמרה בהצלחה!
          </div>
        )}

        <div style={{
          background: 'var(--color-bg-card)', borderRadius: 'var(--radius)',
          border: '1px solid var(--color-border)', overflow: 'hidden', marginBottom: '16px',
        }}>
          {students.map(student => {
            const isPresent = attendance[student] !== false
            return (
              <div
                key={student}
                onClick={() => toggleStudent(student)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '12px 14px', borderBottom: '1px solid var(--color-border)',
                  cursor: 'pointer', transition: 'background 0.15s',
                }}
              >
                <div style={{
                  width: '28px', height: '28px', borderRadius: '6px',
                  border: isPresent ? 'none' : '2px solid var(--color-danger)',
                  background: isPresent ? 'var(--color-success)' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, transition: 'all 0.2s',
                }}>
                  {isPresent && <span style={{ color: '#fff', fontSize: '16px', fontWeight: 800 }}>✓</span>}
                  {!isPresent && <span style={{ color: 'var(--color-danger)', fontSize: '14px', fontWeight: 800 }}>✕</span>}
                </div>
                <span style={{
                  flex: 1, fontSize: '14px', fontWeight: 600,
                  color: isPresent ? 'var(--color-text)' : 'var(--color-danger)',
                  textDecoration: isPresent ? 'none' : 'line-through',
                }}>{student}</span>
                <span style={{
                  fontSize: '12px', fontWeight: 700,
                  color: isPresent ? 'var(--color-success)' : 'var(--color-danger)',
                }}>
                  {isPresent ? 'נוכח' : 'לא נוכח'}
                </span>
              </div>
            )
          })}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button
            onClick={handleSave}
            style={{
              background: 'var(--color-success)', color: '#fff', border: 'none',
              borderRadius: 'var(--radius-sm)', padding: '14px 48px',
              fontSize: '16px', fontWeight: 800, cursor: 'pointer',
            }}
          >
            שמור נוכחות
          </button>
        </div>
      </>
    } />
  )
}
