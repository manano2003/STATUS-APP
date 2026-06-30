import { useState, useEffect } from 'react'
import { supabase } from '../data/supabase'
import { loadSchoolsFromDB, loadSchoolClassesFromDB, loadSchoolEmergencyFromDB, loadSchoolUsersFromDB, loadSchoolAttendanceFromDB } from '../data/sourceData'
import SchoolHome from './SchoolHome'

interface SchoolClass { name: string; students: string[] }
interface SchoolRecord { id: string; name: string; councilId: string }

const councils = [
  { id: 'mateh-yehuda', name: 'מטה יהודה', icon: '🏛️' },
]

function loadCouncilLogos(): Record<string, string> {
  try { return JSON.parse(localStorage.getItem('council_logos') || '{}') } catch { return {} }
}
function loadSchoolLogos(): Record<string, string> {
  try { return JSON.parse(localStorage.getItem('school_logos') || '{}') } catch { return {} }
}

export default function SchoolCouncilView() {
  const [allSchools, setAllSchools] = useState<SchoolRecord[]>([])
  const [selectedCouncil, setSelectedCouncil] = useState<string | null>(null)
  const [councilStats, setCouncilStats] = useState<{ totalStudents: number; totalPresent: number; totalAbsent: number }>({ totalStudents: 0, totalPresent: 0, totalAbsent: 0 })
  const [schoolEmergencyMap, setSchoolEmergencyMap] = useState<Record<string, Record<string, string>>>({})
  const [schoolClassCountMap, setSchoolClassCountMap] = useState<Record<string, number>>({})
  const councilLogos = loadCouncilLogos()
  const schoolLogos = loadSchoolLogos()
  const [selectedSchool, setSelectedSchool] = useState<string | null>(null)
  const [classes, setClasses] = useState<SchoolClass[]>([])
  const [emergency, setEmergency] = useState<Record<string, string>>({})
  const [staffUsers, setStaffUsers] = useState<any[]>([])
  const [attendanceMap, setAttendanceMap] = useState<Record<string, Record<string, boolean>>>({})
  const [expandedClass, setExpandedClass] = useState<string | null>(null)

  useEffect(() => {
    loadSchoolsFromDB().then(setAllSchools)
  }, [])

  // Load council-level stats
  useEffect(() => {
    if (!selectedCouncil) return
    const schools = allSchools.filter(s => s.councilId === selectedCouncil)
    const today = new Date().toISOString().split('T')[0]
    const loadStats = async () => {
      let totalStudents = 0, totalPresent = 0, totalAbsent = 0
      const emergMap: Record<string, Record<string, string>> = {}
      const classCountMap: Record<string, number> = {}
      for (const school of schools) {
        const cls = await loadSchoolClassesFromDB(school.id)
        classCountMap[school.id] = cls.length
        const emerg = await loadSchoolEmergencyFromDB(school.id)
        emergMap[school.id] = emerg
        for (const c of cls) {
          totalStudents += c.students.length
          const att = await loadSchoolAttendanceFromDB(school.id, c.name, today)
          const present = Object.values(att).filter(v => v === true).length
          const absent = Object.values(att).filter(v => v === false).length
          totalPresent += present
          totalAbsent += absent
        }
      }
      setCouncilStats({ totalStudents, totalPresent, totalAbsent })
      setSchoolEmergencyMap(emergMap)
      setSchoolClassCountMap(classCountMap)
    }
    loadStats()

    // Realtime refresh
    const channel = supabase.channel(`council-stats-${selectedCouncil}`)
      .on('postgres_changes', { event: '*', schema: 'status', table: 'school_attendance' }, () => loadStats())
      .on('postgres_changes', { event: '*', schema: 'status', table: 'school_emergency' }, () => loadStats())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [selectedCouncil, allSchools])

  const loadAllAttendance = async (sid: string, classList: SchoolClass[]) => {
    const today = new Date().toISOString().split('T')[0]
    const map: Record<string, Record<string, boolean>> = {}
    for (const c of classList) {
      map[c.name] = await loadSchoolAttendanceFromDB(sid, c.name, today)
    }
    setAttendanceMap(map)
  }

  useEffect(() => {
    if (!selectedSchool) return
    const init = async () => {
      const cls = await loadSchoolClassesFromDB(selectedSchool)
      setClasses(cls)
      loadAllAttendance(selectedSchool, cls)
    }
    init()
    loadSchoolEmergencyFromDB(selectedSchool).then(setEmergency)
    loadSchoolUsersFromDB(selectedSchool).then(setStaffUsers)

    const channel = supabase.channel(`council-view-${selectedSchool}`)
      .on('postgres_changes', { event: '*', schema: 'status', table: 'school_attendance', filter: `school_id=eq.${selectedSchool}` }, () => {
        loadSchoolClassesFromDB(selectedSchool).then(cls => { setClasses(cls); loadAllAttendance(selectedSchool, cls) })
      })
      .on('postgres_changes', { event: '*', schema: 'status', table: 'school_emergency', filter: `school_id=eq.${selectedSchool}` }, () => {
        loadSchoolEmergencyFromDB(selectedSchool).then(setEmergency)
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [selectedSchool])

  // Level 3: School selected - show class dashboard
  if (selectedSchool) {
    const schoolName = allSchools.find(s => s.id === selectedSchool)?.name || selectedSchool
    const totalStudents = classes.reduce((sum, c) => sum + c.students.length, 0)
    let totalPresent = 0
    classes.forEach(c => {
      const att = attendanceMap[c.name] || {}
      totalPresent += Object.values(att).filter(v => v === true).length
    })
    const percent = totalStudents > 0 ? Math.round((totalPresent / totalStudents) * 100) : 0
    const hasAnyEmergency = Object.values(emergency).some(s => s === 'protected' || s === 'not_protected')

    return (
      <SchoolHome content={
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <p style={{ fontSize: '18px', fontWeight: 800, color: '#fff', margin: 0 }}>{schoolName}</p>
            <button onClick={() => { setSelectedSchool(null); setExpandedClass(null) }} style={{
              background: 'rgba(77, 166, 232, 0.15)', border: '1px solid var(--color-accent)',
              borderRadius: 'var(--radius-sm)', color: 'var(--color-accent)',
              cursor: 'pointer', fontSize: '13px', fontWeight: 700, padding: '8px 16px',
            }}>חזרה לבתי ספר</button>
          </div>

          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', textAlign: 'center', marginBottom: '16px' }}>
            {classes.length} כיתות | {totalStudents} תלמידים
          </p>

          {/* Stats */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
            <div style={{ flex: 1, background: 'var(--color-bg-card)', border: '2px solid #fff', borderRadius: 'var(--radius)', padding: '16px', textAlign: 'center' }}>
              <p style={{ fontSize: '28px', fontWeight: 800, color: '#fff', margin: '0 0 4px' }}>{totalPresent}/{totalStudents}</p>
              <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: 0 }}>תלמידים נוכחים</p>
            </div>
            <div style={{ flex: 1, background: 'var(--color-bg-card)', border: '2px solid #fff', borderRadius: 'var(--radius)', padding: '16px', textAlign: 'center' }}>
              <p style={{ fontSize: '28px', fontWeight: 800, margin: '0 0 4px', color: percent >= 80 ? 'var(--color-success)' : percent >= 50 ? 'var(--color-warning)' : 'var(--color-danger)' }}>{percent}%</p>
              <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: 0 }}>אחוז נוכחות</p>
            </div>
          </div>

          {/* Class squares */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '10px', marginBottom: '16px' }}>
            {classes.map(c => {
              const eStatus = emergency[c.name]
              const isProtected = eStatus === 'protected'
              const isNotProtected = eStatus === 'not_protected'
              const noStatus = hasAnyEmergency && !isProtected && !isNotProtected
              const borderColor = isProtected ? 'var(--color-success)' : isNotProtected ? 'var(--color-danger)' : noStatus ? '#fff' : (expandedClass === c.name ? 'var(--color-accent)' : 'var(--color-border)')
              const bgColor = isProtected ? 'rgba(77, 232, 138, 0.1)' : isNotProtected ? 'rgba(232, 77, 77, 0.1)' : noStatus ? 'rgba(255, 255, 255, 0.08)' : (expandedClass === c.name ? 'rgba(77, 166, 232, 0.15)' : 'var(--color-bg-card)')
              const shadow = isProtected ? '0 0 12px rgba(77, 232, 138, 0.4)' : isNotProtected ? '0 0 12px rgba(232, 77, 77, 0.4)' : 'none'

              const attData = attendanceMap[c.name] || {}
              const present = Object.values(attData).filter(v => v === true).length
              const hasAttendance = present > 0
              const absent = c.students.length - present

              return (
                <button key={c.name} onClick={() => setExpandedClass(expandedClass === c.name ? null : c.name)}
                  style={{ background: bgColor, border: `2px solid ${borderColor}`, borderRadius: 'var(--radius)', padding: '16px 8px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s ease', boxShadow: shadow }}>
                  <p style={{ fontSize: '16px', fontWeight: 800, color: '#fff', margin: '0 0 4px' }}>{c.name}</p>
                  <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '0 0 4px' }}>{c.students.length} תלמידים</p>
                  <p style={{ fontSize: '13px', fontWeight: 800, margin: 0, color: hasAttendance ? 'var(--color-success)' : 'var(--color-danger)', textShadow: hasAttendance ? '0 0 8px rgba(77, 232, 138, 0.6)' : '0 0 8px rgba(232, 77, 77, 0.6)' }}>
                    {present} נוכחים
                  </p>
                  {hasAttendance && absent > 0 && (
                    <p style={{ fontSize: '13px', fontWeight: 800, margin: '4px 0 0', color: 'var(--color-danger)' }}>{absent}-</p>
                  )}
                </button>
              )
            })}
          </div>

          {/* Expanded class */}
          {expandedClass && (() => {
            const cls = classes.find(c => c.name === expandedClass)
            if (!cls) return null
            const attendance: Record<string, boolean> = attendanceMap[cls.name] || {}
            const teacher = staffUsers.find((u: any) => u.className === cls.name)
            return (
              <div style={{ background: 'rgba(255, 255, 255, 0.06)', borderRadius: 'var(--radius)', border: '2px solid var(--color-accent)', overflow: 'hidden', marginBottom: '16px' }}>
                <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--color-border)', background: 'rgba(77, 166, 232, 0.05)', textAlign: 'center' }}>
                  <span style={{ fontSize: '17px', fontWeight: 800, color: 'var(--color-accent)' }}>כיתה {cls.name} ({cls.students.length})</span>
                </div>
                {teacher && (
                  <div style={{ display: 'flex', alignItems: 'center', padding: '10px 14px', borderBottom: '2px solid var(--color-accent)', fontSize: '13px', background: 'rgba(77, 166, 232, 0.08)' }}>
                    <span style={{ flex: 1, fontWeight: 700, color: 'var(--color-accent)' }}>{teacher.fullName} (מורה)</span>
                    {teacher.phone && <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', direction: 'ltr' }}>{teacher.phone}</span>}
                  </div>
                )}
                {cls.students.map(student => {
                  const status = attendance[student]
                  return (
                    <div key={student} style={{ display: 'flex', alignItems: 'center', padding: '10px 14px', borderBottom: '1px solid var(--color-border)', fontSize: '13px' }}>
                      <span style={{ flex: 1 }}>{student}</span>
                      {status === true && <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-success)' }}>נוכח</span>}
                      {status === false && <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-danger)' }}>לא נוכח</span>}
                    </div>
                  )
                })}
                <div style={{ padding: '10px', borderTop: '1px solid var(--color-border)' }}>
                  <button onClick={() => {
                    const presentCount = Object.values(attendance).filter(v => v === true).length
                    const absentCount = Object.values(attendance).filter(v => v === false).length
                    let text = `כיתה ${cls.name}\n`
                    if (teacher) text += `מורה: ${teacher.fullName}\n`
                    text += `${cls.students.length} תלמידים | ${presentCount} נוכחים | ${absentCount} חסרים\n\n`
                    cls.students.forEach(s => {
                      const st = attendance[s]
                      text += `${s} — ${st === true ? 'נוכח' : st === false ? 'לא נוכח' : ''}\n`
                    })
                    const w = window.open('', '_blank')
                    if (w) {
                      w.document.write(`<html dir="rtl"><head><title>כיתה ${cls.name}</title><style>body{font-family:Arial;padding:40px;direction:rtl}h1{color:#0A1628;border-bottom:2px solid #4DA6E8;padding-bottom:10px}pre{white-space:pre-wrap;font-family:Arial;font-size:14px;line-height:1.8}</style></head><body><h1>כיתה ${cls.name}</h1><pre>${text}</pre><script>window.print()<\/script></body></html>`)
                      w.document.close()
                    }
                  }} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)', background: 'var(--color-bg-card)',
                    color: 'var(--color-accent)', fontSize: '14px', fontWeight: 700, cursor: 'pointer',
                    fontFamily: 'var(--font-family)',
                  }}>
                    <span style={{ fontSize: '18px' }}>🖨️</span> הדפסה
                  </button>
                </div>
              </div>
            )
          })()}
        </>
      } />
    )
  }

  // Level 2: Council selected - show school squares
  if (selectedCouncil) {
    const council = councils.find(c => c.id === selectedCouncil)
    const schools = allSchools.filter(s => s.councilId === selectedCouncil)
    return (
      <SchoolHome content={
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <p style={{ fontSize: '18px', fontWeight: 800, color: '#fff', margin: 0 }}>{council?.name}</p>
            <button onClick={() => setSelectedCouncil(null)} style={{
              background: 'rgba(77, 166, 232, 0.15)', border: '1px solid var(--color-accent)',
              borderRadius: 'var(--radius-sm)', color: 'var(--color-accent)',
              cursor: 'pointer', fontSize: '13px', fontWeight: 700, padding: '8px 16px',
            }}>חזרה למועצות</button>
          </div>
          {/* Council stats */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
            <div style={{ flex: 1, background: 'var(--color-bg-card)', border: '2px solid #fff', borderRadius: 'var(--radius)', padding: '16px', textAlign: 'center' }}>
              <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '0 0 8px' }}>מוסדות חינוך</p>
              <p style={{ fontSize: '28px', fontWeight: 800, color: 'var(--color-accent)', margin: 0 }}>{schools.length}</p>
            </div>
            <div style={{ flex: 1, background: 'var(--color-bg-card)', border: '2px solid #fff', borderRadius: 'var(--radius)', padding: '12px', textAlign: 'center' }}>
              <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '0 0 8px' }}>תלמידים רשומים</p>
              <p style={{ fontSize: '28px', fontWeight: 800, color: '#fff', margin: '0 0 8px' }}>{councilStats.totalStudents}</p>
              <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', margin: '0 0 4px' }}>נוכחים / לא נוכחים</p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--color-success)' }}>{councilStats.totalPresent}</span>
                <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--color-text-secondary)' }}>/</span>
                <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--color-danger)' }}>{councilStats.totalAbsent}</span>
              </div>
            </div>
          </div>

          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', textAlign: 'center', marginBottom: '16px' }}>
            בתי ספר במועצה
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center' }}>
            {schools.map(school => {
              const emerg = schoolEmergencyMap[school.id] || {}
              const classCount = schoolClassCountMap[school.id] || 0
              const hasAnyEmergency = Object.values(emerg).some(s => s === 'protected' || s === 'not_protected')
              const protectedCount = Object.values(emerg).filter(s => s === 'protected').length
              const allProtected = hasAnyEmergency && protectedCount === classCount && classCount > 0
              const emergBorder = allProtected ? 'var(--color-success)' : hasAnyEmergency ? 'var(--color-danger)' : 'var(--color-border)'
              const emergBg = allProtected ? 'rgba(77, 232, 138, 0.1)' : hasAnyEmergency ? 'rgba(232, 77, 77, 0.1)' : 'var(--color-bg-card)'
              const emergShadow = allProtected ? '0 0 15px rgba(77, 232, 138, 0.4)' : hasAnyEmergency ? '0 0 15px rgba(232, 77, 77, 0.4)' : 'none'
              return (
              <button
                key={school.id}
                onClick={() => setSelectedSchool(school.id)}
                style={{
                  background: emergBg, border: `2px solid ${emergBorder}`,
                  borderRadius: 'var(--radius)', width: '160px', padding: '32px 16px',
                  cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s ease',
                  boxShadow: emergShadow,
                }}
                onMouseEnter={e => { if (!hasAnyEmergency) { e.currentTarget.style.borderColor = 'var(--color-accent)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-glow)' } }}
                onMouseLeave={e => { if (!hasAnyEmergency) { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' } }}
              >
                {schoolLogos[school.id] ? (
                  <img src={schoolLogos[school.id]} alt={school.name} style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', display: 'block', margin: '0 auto 12px' }} />
                ) : (
                  <span style={{ fontSize: '48px', display: 'block', marginBottom: '12px' }}>🏫</span>
                )}
                <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-text)' }}>{school.name}</span>
              </button>
            )})}
          </div>
        </>
      } />
    )
  }

  // Level 1: Show council squares
  return (
    <SchoolHome content={
      <>
        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', textAlign: 'center', marginBottom: '16px' }}>
          מועצות
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center' }}>
          {councils.map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedCouncil(c.id)}
              style={{
                background: 'var(--color-bg-card)', border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius)', width: '160px', padding: '32px 16px',
                cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-accent)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-glow)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
            >
              {councilLogos[c.id] ? (
                <img src={councilLogos[c.id]} alt={c.name} style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', display: 'block', margin: '0 auto 12px' }} />
              ) : (
                <span style={{ fontSize: '48px', display: 'block', marginBottom: '12px' }}>{c.icon}</span>
              )}
              <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-text)' }}>{c.name}</span>
            </button>
          ))}
        </div>
      </>
    } />
  )
}
