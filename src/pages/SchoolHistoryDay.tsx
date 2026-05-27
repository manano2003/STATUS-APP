import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../data/supabase'
import { loadSchoolClassesFromDB, getSchoolClassesFromCache } from '../data/sourceData'
import SchoolHome from './SchoolHome'

interface SchoolClass {
  name: string
  students: string[]
}

export default function SchoolHistoryDay() {
  const { schoolId, date } = useParams<{ schoolId: string; date: string }>()
  const [classes, setClasses] = useState<SchoolClass[]>(() => getSchoolClassesFromCache(schoolId || ''))
  const [attendanceData, setAttendanceData] = useState<Record<string, Record<string, boolean>>>({})
  const [expandedClass, setExpandedClass] = useState<string | null>(null)

  useEffect(() => {
    if (schoolId) loadSchoolClassesFromDB(schoolId).then(setClasses)
  }, [schoolId])

  useEffect(() => {
    if (!schoolId || !date) return
    supabase.from('school_attendance').select('class_name, attendance')
      .eq('school_id', schoolId)
      .eq('date', date)
      .then(({ data }) => {
        if (data) {
          const map: Record<string, Record<string, boolean>> = {}
          data.forEach((r: any) => { map[r.class_name] = r.attendance || {} })
          setAttendanceData(map)
        }
      })
  }, [schoolId, date])

  const totalStudents = classes.reduce((sum, c) => sum + c.students.length, 0)
  let totalPresent = 0
  classes.forEach(c => {
    const att = attendanceData[c.name] || {}
    totalPresent += Object.values(att).filter(v => v === true).length
  })
  const percent = totalStudents > 0 ? Math.round((totalPresent / totalStudents) * 100) : 0

  const formattedDate = date ? new Date(date + 'T00:00:00').toLocaleDateString('he-IL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : ''

  return (
    <SchoolHome backTo={`/schools/${schoolId}/history`} content={
      <>
        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', textAlign: 'center', marginBottom: '16px' }}>
          {formattedDate}
        </p>

        {/* Stats boxes */}
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

        {/* Classes grid */}
        {classes.length > 0 && (
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
            gap: '10px', marginBottom: '16px',
          }}>
            {classes.map(c => {
              const att = attendanceData[c.name] || {}
              const present = Object.values(att).filter(v => v === true).length
              const hasAttendance = Object.keys(att).length > 0
              return (
                <button
                  key={c.name}
                  onClick={() => setExpandedClass(expandedClass === c.name ? null : c.name)}
                  style={{
                    background: expandedClass === c.name ? 'rgba(77, 166, 232, 0.15)' : 'var(--color-bg-card)',
                    border: `1px solid ${expandedClass === c.name ? 'var(--color-accent)' : 'var(--color-border)'}`,
                    borderRadius: 'var(--radius)',
                    padding: '16px 8px',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <p style={{ fontSize: '16px', fontWeight: 800, color: '#fff', margin: '0 0 4px' }}>
                    {c.name}
                  </p>
                  <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '0 0 4px' }}>
                    {c.students.length} תלמידים
                  </p>
                  <p style={{
                    fontSize: '13px', fontWeight: 800, margin: 0,
                    color: hasAttendance ? 'var(--color-success)' : 'var(--color-danger)',
                    textShadow: hasAttendance ? '0 0 8px rgba(77, 232, 138, 0.6)' : '0 0 8px rgba(232, 77, 77, 0.6)',
                  }}>
                    {present} נוכחים
                  </p>
                </button>
              )
            })}
          </div>
        )}

        {/* Expanded class - student list */}
        {expandedClass && (() => {
          const cls = classes.find(c => c.name === expandedClass)
          if (!cls) return null
          const att = attendanceData[cls.name] || {}
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
              {cls.students.map(student => {
                const status = att[student]
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
              })}
            </div>
          )
        })()}
      </>
    } />
  )
}
