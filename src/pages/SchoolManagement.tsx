import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { loadSchoolClassesFromDB, getSchoolClassesFromCache, loadSchoolEmergencyFromDB, getSchoolEmergencyFromCache } from '../data/sourceData'
import SchoolHome from './SchoolHome'

interface SchoolClass {
  name: string
  students: string[]
}

export default function SchoolManagement() {
  const { schoolId } = useParams<{ schoolId: string }>()
  const navigate = useNavigate()
  const [classes, setClasses] = useState<SchoolClass[]>(() => getSchoolClassesFromCache(schoolId || ''))
  const [emergency, setEmergency] = useState<Record<string, string>>(() => getSchoolEmergencyFromCache(schoolId || ''))

  useEffect(() => {
    if (schoolId) {
      loadSchoolClassesFromDB(schoolId).then(setClasses)
      loadSchoolEmergencyFromDB(schoolId).then(setEmergency)
    }
  }, [schoolId])
  const [expandedClass, setExpandedClass] = useState<string | null>(null)

  const totalStudents = classes.reduce((sum, c) => sum + c.students.length, 0)

  return (
    <SchoolHome content={
      <>
        {/* Summary */}
        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', textAlign: 'center', marginBottom: '16px' }}>
          {classes.length} כיתות | {totalStudents} תלמידים
        </p>

        {/* Stats boxes */}
        {(() => {
          const today = new Date().toISOString().split('T')[0]
          let totalPresent = 0
          classes.forEach(c => {
            try {
              const attendance = JSON.parse(localStorage.getItem(`school_attendance_${schoolId}_${c.name}_${today}`) || '{}')
              totalPresent += Object.values(attendance).filter(v => v === true).length
            } catch {}
          })
          const percent = totalStudents > 0 ? Math.round((totalPresent / totalStudents) * 100) : 0
          return (
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
              <div style={{
                flex: 1, background: 'var(--color-bg-card)', border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius)', padding: '16px', textAlign: 'center',
              }}>
                <p style={{ fontSize: '28px', fontWeight: 800, color: '#fff', margin: '0 0 4px' }}>
                  {totalPresent}/{totalStudents}
                </p>
                <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: 0 }}>תלמידים נוכחים</p>
              </div>
              <div style={{
                flex: 1, background: 'var(--color-bg-card)', border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius)', padding: '16px', textAlign: 'center',
              }}>
                <p style={{
                  fontSize: '28px', fontWeight: 800, margin: '0 0 4px',
                  color: percent >= 80 ? 'var(--color-success)' : percent >= 50 ? 'var(--color-warning)' : 'var(--color-danger)',
                }}>
                  {percent}%
                </p>
                <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: 0 }}>אחוז נוכחות</p>
              </div>
            </div>
          )
        })()}

        {/* Classes grid */}
        {classes.length > 0 ? (
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
            gap: '10px', marginBottom: '16px',
          }}>
            {classes.map(c => {
              const eStatus = emergency[c.name]
              const isProtected = eStatus === 'protected'
              const isNotProtected = eStatus === 'not_protected'
              const borderColor = isProtected ? 'var(--color-success)' : isNotProtected ? 'var(--color-danger)' : (expandedClass === c.name ? 'var(--color-accent)' : 'var(--color-border)')
              const bgColor = isProtected ? 'rgba(77, 232, 138, 0.1)' : isNotProtected ? 'rgba(232, 77, 77, 0.1)' : (expandedClass === c.name ? 'rgba(77, 166, 232, 0.15)' : 'var(--color-bg-card)')
              const shadow = isProtected ? '0 0 12px rgba(77, 232, 138, 0.4)' : isNotProtected ? '0 0 12px rgba(232, 77, 77, 0.4)' : 'none'
              return (
              <button
                key={c.name}
                onClick={() => setExpandedClass(expandedClass === c.name ? null : c.name)}
                style={{
                  background: bgColor,
                  border: `2px solid ${borderColor}`,
                  borderRadius: 'var(--radius)',
                  padding: '16px 8px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.2s ease',
                  boxShadow: shadow,
                }}
              >
                <p style={{ fontSize: '16px', fontWeight: 800, color: '#fff', margin: '0 0 4px' }}>
                  {c.name}
                </p>
                <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '0 0 4px' }}>
                  {c.students.length} תלמידים
                </p>
                {(() => {
                  let present = 0
                  try {
                    const attendance = JSON.parse(localStorage.getItem(`school_attendance_${schoolId}_${c.name}_${new Date().toISOString().split('T')[0]}`) || '{}')
                    present = Object.values(attendance).filter(v => v === true).length
                  } catch {}
                  const hasAttendance = present > 0
                  return (
                    <p style={{
                      fontSize: '13px', fontWeight: 800, margin: 0,
                      color: hasAttendance ? 'var(--color-success)' : 'var(--color-danger)',
                      textShadow: hasAttendance ? '0 0 8px rgba(77, 232, 138, 0.6)' : '0 0 8px rgba(232, 77, 77, 0.6)',
                    }}>
                      {present} נוכחים
                    </p>
                  )
                })()}
              </button>
            )})}
          </div>
        ) : (
          <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '13px', marginBottom: '16px' }}>
            אין כיתות - העלה אקסל בטבלאות מקור
          </p>
        )}

        {/* Expanded class - student list */}
        {expandedClass && (() => {
          const cls = classes.find(c => c.name === expandedClass)
          if (!cls) return null
          return (
            <div style={{
              background: 'rgba(255, 255, 255, 0.06)',
              borderRadius: 'var(--radius)',
              border: '2px solid var(--color-accent)',
              overflow: 'hidden',
              marginBottom: '16px',
            }}>
              <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--color-border)', background: 'rgba(77, 166, 232, 0.05)', textAlign: 'center' }}>
                <span style={{ fontSize: '17px', fontWeight: 800, color: 'var(--color-accent)' }}>
                  כיתה {cls.name} ({cls.students.length})
                </span>
              </div>
              {(() => {
                const today = new Date().toISOString().split('T')[0]
                let attendance: Record<string, boolean> = {}
                try { attendance = JSON.parse(localStorage.getItem(`school_attendance_${schoolId}_${cls.name}_${today}`) || '{}') } catch {}
                return cls.students.map(student => {
                  const status = attendance[student]
                  return (
                    <div key={student} style={{
                      display: 'flex', alignItems: 'center', padding: '10px 14px',
                      borderBottom: '1px solid var(--color-border)', fontSize: '13px',
                    }}>
                      <span style={{ flex: 1 }}>{student}</span>
                      {status === true && (
                        <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-success)' }}>נוכח</span>
                      )}
                      {status === false && (
                        <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-danger)' }}>לא נוכח</span>
                      )}
                    </div>
                  )
                })
              })()}
            </div>
          )
        })()}

        {/* Quick access buttons */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '60px', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate(`/schools/${schoolId}/sources`)}
            style={{
              flex: 1, minWidth: '80px', padding: '14px', background: 'var(--color-bg-card)',
              border: '1px solid var(--color-border)', borderRadius: 'var(--radius)',
              cursor: 'pointer', textAlign: 'center',
            }}
          >
            <span style={{ fontSize: '20px' }}>📋</span>
            <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-accent)', margin: '4px 0 0' }}>טבלאות מקור</p>
          </button>
          <button
            onClick={() => navigate(`/schools/${schoolId}/history`)}
            style={{
              flex: 1, minWidth: '80px', padding: '14px', background: 'var(--color-bg-card)',
              border: '1px solid var(--color-border)', borderRadius: 'var(--radius)',
              cursor: 'pointer', textAlign: 'center',
            }}
          >
            <span style={{ fontSize: '20px' }}>📜</span>
            <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-warning)', margin: '4px 0 0' }}>היסטוריה</p>
          </button>
          <button
            onClick={() => alert('אזור בבניה')}
            style={{
              flex: 1, minWidth: '80px', padding: '14px', background: 'var(--color-bg-card)',
              border: '1px solid var(--color-border)', borderRadius: 'var(--radius)',
              cursor: 'pointer', textAlign: 'center',
            }}
          >
            <span style={{ fontSize: '20px' }}>🗄️</span>
            <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-secondary)', margin: '4px 0 0' }}>גיבוי</p>
          </button>
        </div>
      </>
    } />
  )
}
