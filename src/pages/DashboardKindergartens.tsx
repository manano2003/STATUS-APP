import { useState } from 'react'
import { kindergartens } from '../data/kindergartens'
import { useStore } from '../data/store'
import BackButton from '../components/BackButton'
import ExportButtons from '../components/ExportButtons'

export default function DashboardKindergartens() {
  const { getKindergartenAttendance } = useStore()
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const totalPresent = kindergartens.reduce((sum, k) => {
    const att = getKindergartenAttendance(k.id)
    return sum + (att?.presentChildren.length ?? 0)
  }, 0)
  const totalChildren = kindergartens.reduce((sum, k) => sum + k.children.length, 0)

  return (
    <div style={{ paddingTop: '68px', padding: '68px 16px 80px', maxWidth: '600px', margin: '0 auto' }}>
      <BackButton to="/dashboard" />

      <h1 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '4px', textAlign: 'center' }}>
        👶 נוכחות בגנים
      </h1>
      <p style={{ color: 'var(--color-accent)', fontSize: '18px', fontWeight: 800, marginBottom: '4px', textAlign: 'center' }}>
        נוכחים: {totalPresent} מתוך {totalChildren}
      </p>
      <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px', marginBottom: '16px', textAlign: 'center' }}>
        {totalChildren > 0 ? Math.round((totalPresent / totalChildren) * 100) : 0}% נוכחות
      </p>

      <div style={{
        background: 'var(--color-bg-card)',
        borderRadius: 'var(--radius)',
        border: '1px solid var(--color-border)',
        overflow: 'hidden',
      }}>
        {kindergartens.map(kg => {
          const att = getKindergartenAttendance(kg.id)
          const present = att?.presentChildren.length ?? 0
          const isExpanded = expandedId === kg.id

          return (
            <div key={kg.id}>
              <div
                onClick={() => setExpandedId(isExpanded ? null : kg.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '12px 14px', borderBottom: '1px solid var(--color-border)',
                  cursor: 'pointer', transition: 'background 0.15s',
                  background: isExpanded ? 'rgba(77, 166, 232, 0.05)' : 'transparent',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(77, 166, 232, 0.05)'}
                onMouseLeave={e => { if (!isExpanded) e.currentTarget.style.background = 'transparent' }}
              >
                <span style={{ fontSize: '13px', fontWeight: 700, flex: 1 }}>{kg.name}</span>
                <span style={{
                  fontSize: '13px', fontWeight: 800,
                  color: present > 0 ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                }}>
                  {present}/{kg.children.length}
                </span>
              </div>

              {isExpanded && (
                <div style={{
                  padding: '8px 14px 12px', borderBottom: '1px solid var(--color-border)',
                  background: 'rgba(77, 166, 232, 0.03)',
                }}>
                  {/* Present children first, then absent */}
                  {[...kg.children]
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
                  {kg.staff.length > 0 && (
                    <>
                      <div style={{
                        padding: '6px 0', marginTop: '6px', borderTop: '1px solid var(--color-border)',
                        fontSize: '11px', fontWeight: 800, color: 'var(--color-accent)',
                      }}>
                        סגל חינוכי
                      </div>
                      {kg.staff.map(member => {
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
        title="דוח נוכחות בגנים"
        getText={() => {
          let text = `סה"כ נוכחים: ${totalPresent} מתוך ${totalChildren} (${totalChildren > 0 ? Math.round((totalPresent / totalChildren) * 100) : 0}%)\n\n`
          kindergartens.forEach(kg => {
            const att = getKindergartenAttendance(kg.id)
            const p = att?.presentChildren.length ?? 0
            text += `${kg.name}: ${p}/${kg.children.length}\n`
            if (att) att.presentChildren.forEach(c => { text += `  ✓ ${c}\n` })
          })
          return text
        }}
        getTableData={() => {
          const headers = ['גן', 'שם ילד', 'נוכחות']
          const rows: string[][] = []
          kindergartens.forEach(kg => {
            const att = getKindergartenAttendance(kg.id)
            kg.children.forEach(child => {
              rows.push([kg.name, child, att?.presentChildren.includes(child) ? 'נוכח' : 'חסר'])
            })
          })
          return { headers, rows }
        }}
      />
    </div>
  )
}
