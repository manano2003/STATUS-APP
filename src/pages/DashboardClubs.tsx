import { useState } from 'react'
import { clubs } from '../data/clubs'
import { useStore } from '../data/store'
import BackButton from '../components/BackButton'
import ExportButtons from '../components/ExportButtons'

export default function DashboardClubs() {
  const { getClubAttendance } = useStore()
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const totalChildren = clubs.reduce((sum, k) => sum + k.children.length, 0)
  const totalStaff = clubs.reduce((sum, k) => sum + k.staff.length, 0)
  const totalAll = totalChildren + totalStaff

  const presentChildren = clubs.reduce((sum, k) => {
    const att = getClubAttendance(k.id)
    if (!att) return sum
    return sum + att.presentChildren.filter(name => k.children.includes(name)).length
  }, 0)
  const presentStaff = clubs.reduce((sum, k) => {
    const att = getClubAttendance(k.id)
    if (!att) return sum
    return sum + att.presentChildren.filter(name => k.staff.includes(name)).length
  }, 0)
  const totalPresent = presentChildren + presentStaff

  return (
    <div style={{ paddingTop: '68px', padding: '68px 16px 100px', maxWidth: '600px', margin: '0 auto' }}>
      <BackButton to="/dashboard" />

      <h1 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '12px', textAlign: 'center' }}>
        נוכחות במועדונים
      </h1>

      {/* 3 Summary Boxes */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <div style={{
          flex: 1, padding: '12px 8px', borderRadius: 'var(--radius-sm)',
          background: 'var(--color-bg-card)', border: '1px solid var(--color-border)',
          textAlign: 'center',
        }}>
          <p style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-accent)', margin: '0 0 2px' }}>
            {totalPresent}/{totalAll}
          </p>
          <p style={{ fontSize: '9px', color: 'var(--color-text-secondary)', margin: 0 }}>נוכחות כללית</p>
        </div>
        <div style={{
          flex: 1, padding: '12px 8px', borderRadius: 'var(--radius-sm)',
          background: 'var(--color-bg-card)', border: '1px solid var(--color-border)',
          textAlign: 'center',
        }}>
          <p style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-success)', margin: '0 0 2px' }}>
            {presentChildren}/{totalChildren}
          </p>
          <p style={{ fontSize: '9px', color: 'var(--color-text-secondary)', margin: 0 }}>
            ילדים ({totalChildren > 0 ? Math.round((presentChildren / totalChildren) * 100) : 0}%)
          </p>
        </div>
        <div style={{
          flex: 1, padding: '12px 8px', borderRadius: 'var(--radius-sm)',
          background: 'var(--color-bg-card)', border: '1px solid var(--color-border)',
          textAlign: 'center',
        }}>
          <p style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-warning)', margin: '0 0 2px' }}>
            {presentStaff}/{totalStaff}
          </p>
          <p style={{ fontSize: '9px', color: 'var(--color-text-secondary)', margin: 0 }}>סגל</p>
        </div>
      </div>

      <div style={{
        background: 'var(--color-bg-card)',
        borderRadius: 'var(--radius)',
        border: '1px solid var(--color-border)',
        overflow: 'hidden',
      }}>
        {clubs.map(club => {
          const att = getClubAttendance(club.id)
          const present = att?.presentChildren.length ?? 0
          const isExpanded = expandedId === club.id

          return (
            <div key={club.id}>
              <div
                onClick={() => setExpandedId(isExpanded ? null : club.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '12px 14px', borderBottom: '1px solid var(--color-border)',
                  cursor: 'pointer', transition: 'background 0.15s',
                  background: isExpanded ? 'rgba(77, 166, 232, 0.05)' : 'transparent',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(77, 166, 232, 0.05)'}
                onMouseLeave={e => { if (!isExpanded) e.currentTarget.style.background = 'transparent' }}
              >
                <span style={{ fontSize: '13px', fontWeight: 700, flex: 1 }}>{club.name}</span>
                <span style={{
                  fontSize: '13px', fontWeight: 800,
                  color: present > 0 ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                }}>
                  {present}/{club.children.length}
                </span>
              </div>

              {isExpanded && (
                <div style={{
                  padding: '8px 14px 12px', borderBottom: '1px solid var(--color-border)',
                  background: 'rgba(77, 166, 232, 0.03)',
                }}>
                  {/* Present children first, then absent */}
                  {[...club.children]
                    .sort((a, b) => {
                      const aPresent = att?.presentChildren.includes(a) ? 0 : 1
                      const bPresent = att?.presentChildren.includes(b) ? 0 : 1
                      return aPresent - bPresent
                    })
                    .map(child => {
                      const isPresent = att?.presentChildren.includes(child) ?? false
                      return (
                        <div key={child} style={{
                          display: 'flex', alignItems: 'center', gap: '8px',
                          padding: '6px 0', fontSize: '12px',
                        }}>
                          <span style={{
                            width: '8px', height: '8px', borderRadius: '50%',
                            background: isPresent ? 'var(--color-success)' : 'rgba(255,255,255,0.15)',
                            flexShrink: 0,
                          }} />
                          <span style={{
                            fontWeight: isPresent ? 700 : 400,
                            color: isPresent ? 'var(--color-text)' : 'var(--color-text-secondary)',
                          }}>
                            {child}
                          </span>
                        </div>
                      )
                    })}
                  {/* Staff */}
                  {club.staff.length > 0 && (
                    <>
                      <div style={{
                        padding: '6px 0', marginTop: '6px', borderTop: '1px solid var(--color-border)',
                        fontSize: '11px', fontWeight: 800, color: 'var(--color-accent)',
                      }}>
                        סגל חינוכי
                      </div>
                      {club.staff.map(member => {
                        const isPresent = att?.presentChildren.includes(member) ?? false
                        return (
                          <div key={member} style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            padding: '4px 0', fontSize: '12px',
                          }}>
                            <span style={{
                              width: '8px', height: '8px', borderRadius: '50%',
                              background: isPresent ? 'var(--color-accent)' : 'rgba(255,255,255,0.15)',
                              flexShrink: 0,
                            }} />
                            <span style={{
                              fontWeight: isPresent ? 700 : 400,
                              color: isPresent ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                            }}>
                              {member}
                            </span>
                          </div>
                        )
                      })}
                    </>
                  )}
                  {att && (
                    <p style={{ fontSize: '10px', color: 'var(--color-text-secondary)', marginTop: '8px' }}>
                      דווח ע"י: {att.reportedBy} | {new Date(att.timestamp).toLocaleString('he-IL', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
                    </p>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <ExportButtons
        title="דוח נוכחות במועדונים"
        getText={() => {
          let text = `סה"כ נוכחים: ${totalPresent} מתוך ${totalChildren} (${totalChildren > 0 ? Math.round((totalPresent / totalChildren) * 100) : 0}%)\n\n`
          clubs.forEach(club => {
            const att = getClubAttendance(club.id)
            const p = att?.presentChildren.length ?? 0
            text += `${club.name}: ${p}/${club.children.length}\n`
            if (att) att.presentChildren.forEach(c => { text += `  ✓ ${c}\n` })
          })
          return text
        }}
        getTableData={() => {
          const headers = ['מועדון', 'שם ילד', 'נוכחות']
          const rows: string[][] = []
          clubs.forEach(club => {
            const att = getClubAttendance(club.id)
            club.children.forEach(child => {
              rows.push([club.name, child, att?.presentChildren.includes(child) ? 'נוכח' : 'חסר'])
            })
          })
          return { headers, rows }
        }}
      />
    </div>
  )
}
