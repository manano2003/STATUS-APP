import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useStore } from '../data/store'
import { supabase } from '../data/supabase'
import { loadSchoolClassesFromDB, getSchoolClassesFromCache, loadSchoolEmergencyFromDB, getSchoolEmergencyFromCache, saveSchoolEmergencyToDB, loadSchoolUsersFromDB, getSchoolUsersFromCache, loadSchoolAttendanceFromDB, saveSchoolAttendanceToDB } from '../data/sourceData'
import SchoolHome from './SchoolHome'

interface SchoolClass {
  name: string
  students: string[]
}

export default function SchoolManagement() {
  const { schoolId } = useParams<{ schoolId: string }>()
  const navigate = useNavigate()
  const { currentUser } = useStore()
  const [classes, setClasses] = useState<SchoolClass[]>(() => getSchoolClassesFromCache(schoolId || ''))
  const [emergency, setEmergency] = useState<Record<string, string>>(() => getSchoolEmergencyFromCache(schoolId || ''))
  const [staffUsers, setStaffUsers] = useState<any[]>(() => getSchoolUsersFromCache(schoolId || ''))
  const [attendanceMap, setAttendanceMap] = useState<Record<string, Record<string, boolean>>>({})

  const loadAllAttendance = async (sid: string, classList: SchoolClass[]) => {
    const today = new Date().toISOString().split('T')[0]
    const map: Record<string, Record<string, boolean>> = {}
    for (const c of classList) {
      map[c.name] = await loadSchoolAttendanceFromDB(sid, c.name, today)
    }
    setAttendanceMap(map)
  }

  useEffect(() => {
    if (!schoolId) return
    const refresh = async () => {
      const cls = await loadSchoolClassesFromDB(schoolId)
      setClasses(cls)
      loadSchoolEmergencyFromDB(schoolId).then(setEmergency)
      loadSchoolUsersFromDB(schoolId).then(setStaffUsers)
      loadAllAttendance(schoolId, cls)
    }
    refresh()

    // Realtime subscription - instant updates from any device
    const channel = supabase.channel(`school-${schoolId}`)
      .on('postgres_changes', { event: '*', schema: 'status', table: 'school_attendance', filter: `school_id=eq.${schoolId}` }, () => {
        loadSchoolClassesFromDB(schoolId).then(cls => { setClasses(cls); loadAllAttendance(schoolId, cls) })
      })
      .on('postgres_changes', { event: '*', schema: 'status', table: 'school_emergency', filter: `school_id=eq.${schoolId}` }, () => refresh())
      .on('postgres_changes', { event: '*', schema: 'status', table: 'school_classes', filter: `school_id=eq.${schoolId}` }, () => refresh())
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [schoolId])
  const [expandedClass, setExpandedClass] = useState<string | null>(null)
  const [showResetPopup, setShowResetPopup] = useState(false)

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
          let totalPresent = 0
          classes.forEach(c => {
            const att = attendanceMap[c.name] || {}
            totalPresent += Object.values(att).filter(v => v === true).length
          })
          const percent = totalStudents > 0 ? Math.round((totalPresent / totalStudents) * 100) : 0
          return (
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
              <div style={{
                flex: 1, background: 'var(--color-bg-card)', border: '2px solid #fff',
                borderRadius: 'var(--radius)', padding: '16px', textAlign: 'center',
              }}>
                <p style={{ fontSize: '28px', fontWeight: 800, color: '#fff', margin: '0 0 4px' }}>
                  {totalPresent}/{totalStudents}
                </p>
                <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: 0 }}>תלמידים נוכחים</p>
              </div>
              <div style={{
                flex: 1, background: 'var(--color-bg-card)', border: '2px solid #fff',
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
            {(() => {
              const hasAnyEmergency = Object.values(emergency).some(s => s === 'protected' || s === 'not_protected')
              return classes.map(c => {
              const eStatus = emergency[c.name]
              const isProtected = eStatus === 'protected'
              const isNotProtected = eStatus === 'not_protected'
              const noStatus = hasAnyEmergency && !isProtected && !isNotProtected
              const borderColor = isProtected ? 'var(--color-success)' : isNotProtected ? 'var(--color-danger)' : noStatus ? '#fff' : (expandedClass === c.name ? 'var(--color-accent)' : 'var(--color-border)')
              const bgColor = isProtected ? 'rgba(77, 232, 138, 0.1)' : isNotProtected ? 'rgba(232, 77, 77, 0.1)' : noStatus ? 'rgba(255, 255, 255, 0.08)' : (expandedClass === c.name ? 'rgba(77, 166, 232, 0.15)' : 'var(--color-bg-card)')
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
                  const att = attendanceMap[c.name] || {}
                  const present = Object.values(att).filter(v => v === true).length
                  const hasAttendance = present > 0
                  const absent = c.students.length - present
                  return (
                    <>
                    <p style={{
                      fontSize: '13px', fontWeight: 800, margin: 0,
                      color: hasAttendance ? 'var(--color-success)' : 'var(--color-danger)',
                      textShadow: hasAttendance ? '0 0 8px rgba(77, 232, 138, 0.6)' : '0 0 8px rgba(232, 77, 77, 0.6)',
                    }}>
                      {present} נוכחים
                    </p>
                    {hasAttendance && absent > 0 && (
                      <p style={{ fontSize: '13px', fontWeight: 800, margin: '4px 0 0', color: 'var(--color-danger)' }}>
                        {absent}-
                      </p>
                    )}
                    </>
                  )
                })()}
              </button>
            )})
            })()}
          </div>
        ) : (
          <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '13px', marginBottom: '16px' }}>
            אין כיתות - העלה אקסל בטבלאות מקור
          </p>
        )}

        {/* Popup class student list */}
        {expandedClass && (() => {
          const cls = classes.find(c => c.name === expandedClass)
          if (!cls) return null
          const attendance: Record<string, boolean> = attendanceMap[cls.name] || {}
          const teacher = staffUsers.find((u: any) => u.className === cls.name)
          return (
            <div
              onClick={() => setExpandedClass(null)}
              style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: 9999, padding: '20px',
              }}
            >
              <div
                onClick={e => e.stopPropagation()}
                style={{
                  background: 'var(--color-bg-card)', borderRadius: 'var(--radius)',
                  border: '2px solid var(--color-accent)', overflow: 'hidden',
                  width: '100%', maxWidth: '400px', maxHeight: '80vh', overflowY: 'auto',
                }}
              >
                <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--color-border)', background: 'rgba(77, 166, 232, 0.05)', textAlign: 'center', position: 'sticky', top: 0, zIndex: 1 }}>
                  <span style={{ fontSize: '17px', fontWeight: 800, color: 'var(--color-accent)' }}>
                    כיתה {cls.name} ({cls.students.length})
                  </span>
                  <button onClick={() => setExpandedClass(null)} style={{
                    position: 'absolute', top: 10, left: 10, background: 'none', border: 'none',
                    color: 'var(--color-text-secondary)', fontSize: '20px', cursor: 'pointer', lineHeight: 1,
                  }}>✕</button>
                </div>
                {teacher ? (
                  <div style={{
                    display: 'flex', alignItems: 'center', padding: '10px 14px',
                    borderBottom: '2px solid var(--color-accent)', fontSize: '13px',
                    background: 'rgba(77, 166, 232, 0.08)',
                  }}>
                    <span style={{ flex: 1, fontWeight: 700, color: 'var(--color-accent)' }}>{teacher.fullName} (מורה)</span>
                    {teacher.phone && <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', direction: 'ltr' }}>{teacher.phone}</span>}
                  </div>
                ) : (() => {
                  const classTeachers = staffUsers.filter((u: any) => u.className === cls.name || (u.roles && u.roles.includes('סגל חינוכי') && u.className === cls.name))
                  return classTeachers.length > 0 ? classTeachers.map((t: any) => (
                    <div key={t.id} style={{
                      display: 'flex', alignItems: 'center', padding: '10px 14px',
                      borderBottom: '2px solid var(--color-accent)', fontSize: '13px',
                      background: 'rgba(77, 166, 232, 0.08)',
                    }}>
                      <span style={{ flex: 1, fontWeight: 700, color: 'var(--color-accent)' }}>{t.fullName} (מורה)</span>
                      {t.phone && <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', direction: 'ltr' }}>{t.phone}</span>}
                    </div>
                  )) : null
                })()}
                {cls.students.map(student => {
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
                })}
                <div style={{ padding: '10px', borderTop: '1px solid var(--color-border)' }}>
                  <button onClick={() => {
                    const presentCount = Object.values(attendance).filter(v => v === true).length
                    const absentCount = Object.values(attendance).filter(v => v === false).length
                    const teacherInfo = teacher || ((() => { const t = staffUsers.filter((u: any) => u.className === cls.name); return t[0] })())
                    let text = `כיתה ${cls.name}\n`
                    if (teacherInfo) text += `מורה: ${teacherInfo.fullName}\n`
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
            </div>
          )
        })()}

        {/* Emergency status bar */}
        {(() => {
          const protectedCount = Object.values(emergency).filter(s => s === 'protected').length
          const notProtectedCount = Object.values(emergency).filter(s => s === 'not_protected').length
          const noStatusCount = classes.length - protectedCount - notProtectedCount
          const hasEmergency = protectedCount > 0 || notProtectedCount > 0
          return (
            <div style={{ marginTop: '30px' }}>
              {hasEmergency && (
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '12px' }}>
                  <div style={{
                    background: 'rgba(77, 232, 138, 0.15)', border: '1px solid var(--color-success)',
                    borderRadius: 'var(--radius-sm)', padding: '8px 16px', textAlign: 'center',
                  }}>
                    <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-success)' }}>{protectedCount}</span>
                    <p style={{ fontSize: '10px', color: 'var(--color-success)', margin: '2px 0 0', fontWeight: 700 }}>מוגנים</p>
                  </div>
                  <div style={{
                    background: 'rgba(232, 77, 77, 0.15)', border: '1px solid var(--color-danger)',
                    borderRadius: 'var(--radius-sm)', padding: '8px 16px', textAlign: 'center',
                  }}>
                    <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-danger)' }}>{notProtectedCount}</span>
                    <p style={{ fontSize: '10px', color: 'var(--color-danger)', margin: '2px 0 0', fontWeight: 700 }}>לא מוגנים</p>
                  </div>
                  <div style={{
                    background: 'transparent', border: '1px solid #fff',
                    borderRadius: 'var(--radius-sm)', padding: '8px 16px', textAlign: 'center',
                  }}>
                    <span style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>{noStatusCount}</span>
                    <p style={{ fontSize: '10px', color: 'var(--color-text-secondary)', margin: '2px 0 0', fontWeight: 700 }}>ללא סימון</p>
                  </div>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <button
                  onClick={async () => {
                    if (!schoolId || !hasEmergency) return
                    for (const c of classes) {
                      await saveSchoolEmergencyToDB(schoolId, c.name, 'none', currentUser?.id || '')
                    }
                    setEmergency({})
                  }}
                  style={{
                    background: hasEmergency ? 'var(--color-danger)' : 'transparent',
                    color: hasEmergency ? '#fff' : 'var(--color-text-secondary)',
                    border: `1px solid ${hasEmergency ? 'var(--color-danger)' : 'var(--color-border)'}`,
                    borderRadius: 'var(--radius-sm)',
                    padding: '10px 28px',
                    fontSize: '14px', fontWeight: 700,
                    cursor: hasEmergency ? 'pointer' : 'default',
                    opacity: hasEmergency ? 1 : 0.6,
                  }}
                >
                  גמר אירוע חירום
                </button>
              </div>
            </div>
          )
        })()}

        {/* Reset attendance button */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
          <button
            onClick={() => setShowResetPopup(true)}
            style={{
              background: 'transparent', color: 'var(--color-warning)',
              border: '1px solid var(--color-warning)', borderRadius: 'var(--radius-sm)',
              padding: '10px 28px', fontSize: '14px', fontWeight: 700,
              cursor: 'pointer', fontFamily: 'var(--font-family)',
            }}
          >
            איפוס נוכחות
          </button>
        </div>

        {/* Reset attendance popup */}
        {showResetPopup && (
          <div onClick={() => setShowResetPopup(false)} style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 9999, padding: '20px',
          }}>
            <div onClick={e => e.stopPropagation()} style={{
              background: 'var(--color-bg-card)', borderRadius: 'var(--radius)',
              border: '2px solid var(--color-warning)', padding: '28px 24px', textAlign: 'center',
              width: '100%', maxWidth: '360px',
            }}>
              <p style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-warning)', margin: '0 0 20px' }}>
                האם לשמור בהיסטוריה?
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button onClick={async () => {
                  if (!schoolId) return
                  const today = new Date().toISOString().split('T')[0]
                  // Save snapshot to history
                  const snapshotData = classes.map(c => ({
                    className: c.name,
                    attendance: attendanceMap[c.name] || {},
                    studentCount: c.students.length,
                  }))
                  const totalPresent = classes.reduce((sum, c) => {
                    const att = attendanceMap[c.name] || {}
                    return sum + Object.values(att).filter(v => v === true).length
                  }, 0)
                  await supabase.from('history_school_attendance').insert({
                    school_id: schoolId, date: today, snapshot_data: snapshotData,
                    total_students: classes.reduce((s, c) => s + c.students.length, 0),
                    total_present: totalPresent,
                  })
                  // Clear attendance
                  for (const c of classes) {
                    await saveSchoolAttendanceToDB(schoolId, c.name, today, {}, currentUser?.id || '')
                  }
                  setAttendanceMap({})
                  setShowResetPopup(false)
                }} style={{
                  padding: '14px', borderRadius: 'var(--radius-sm)',
                  background: 'var(--color-accent)', color: '#fff', border: 'none',
                  fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-family)',
                }}>
                  כן — אפס ושמור בהיסטוריה
                </button>
                <button onClick={async () => {
                  if (!schoolId) return
                  const today = new Date().toISOString().split('T')[0]
                  for (const c of classes) {
                    await saveSchoolAttendanceToDB(schoolId, c.name, today, {}, currentUser?.id || '')
                  }
                  setAttendanceMap({})
                  setShowResetPopup(false)
                }} style={{
                  padding: '14px', borderRadius: 'var(--radius-sm)',
                  background: 'transparent', color: 'var(--color-text-secondary)',
                  border: '1px solid var(--color-border)',
                  fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-family)',
                }}>
                  לא — אפס ושלח לגיבוי
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Quick access buttons */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '30px', flexWrap: 'wrap' }}>
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
            onClick={() => navigate(`/schools/${schoolId}/backup`)}
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
