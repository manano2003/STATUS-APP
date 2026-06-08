import { useState, useEffect } from 'react'
import { getSourceKindergartens, loadSourceKindergartensFromDB } from '../data/sourceData'
import { useStore } from '../data/store'
import { supabase } from '../data/supabase'
import PageLayout from '../components/PageLayout'
import ExportButtons from '../components/ExportButtons'

export default function DashboardKindergartens() {
  const { getKindergartenAttendance, currentUser } = useStore()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [popupType, setPopupType] = useState<'all' | 'children' | 'staff' | null>(null)
  const [kindergartens, setKindergartens] = useState(getSourceKindergartens)

  useEffect(() => {
    loadSourceKindergartensFromDB().then(d => { if (d.length > 0) setKindergartens(d) })
  }, [])

  const totalChildren = kindergartens.reduce((sum, k) => sum + k.children.length, 0)
  const totalStaff = kindergartens.reduce((sum, k) => sum + k.staff.length, 0)
  const totalAll = totalChildren + totalStaff

  const presentChildren = kindergartens.reduce((sum, k) => {
    const att = getKindergartenAttendance(k.id)
    if (!att) return sum
    return sum + att.presentChildren.filter(name => k.children.includes(name)).length
  }, 0)
  const presentStaff = kindergartens.reduce((sum, k) => {
    const att = getKindergartenAttendance(k.id)
    if (!att) return sum
    return sum + att.presentChildren.filter(name => k.staff.includes(name)).length
  }, 0)
  const totalPresent = presentChildren + presentStaff

  return (
    <PageLayout title="👶 נוכחות בגנים" backTo="/dashboard">

      {/* 3 Summary Boxes */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <div onClick={() => setPopupType('all')} style={{
          flex: 1, padding: '12px 8px', borderRadius: 'var(--radius-sm)',
          background: 'var(--color-bg-card)', border: '1px solid var(--color-border)',
          textAlign: 'center', cursor: 'pointer',
        }}>
          <p style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-accent)', margin: '0 0 2px' }}>
            {totalPresent}/{totalAll}
          </p>
          <p style={{ fontSize: '9px', color: 'var(--color-text-secondary)', margin: 0 }}>נוכחות כללית</p>
        </div>
        <div onClick={() => setPopupType('children')} style={{
          flex: 1, padding: '12px 8px', borderRadius: 'var(--radius-sm)',
          background: 'var(--color-bg-card)', border: '1px solid var(--color-border)',
          textAlign: 'center', cursor: 'pointer',
        }}>
          <p style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-success)', margin: '0 0 2px' }}>
            {presentChildren}/{totalChildren}
          </p>
          <p style={{ fontSize: '9px', color: 'var(--color-text-secondary)', margin: 0 }}>
            ילדים ({totalChildren > 0 ? Math.round((presentChildren / totalChildren) * 100) : 0}%)
          </p>
        </div>
        <div onClick={() => setPopupType('staff')} style={{
          flex: 1, padding: '12px 8px', borderRadius: 'var(--radius-sm)',
          background: 'var(--color-bg-card)', border: '1px solid var(--color-border)',
          textAlign: 'center', cursor: 'pointer',
        }}>
          <p style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-warning)', margin: '0 0 2px' }}>
            {presentStaff}/{totalStaff}
          </p>
          <p style={{ fontSize: '9px', color: 'var(--color-text-secondary)', margin: 0 }}>סגל</p>
        </div>
      </div>

      {/* Popup */}
      {popupType && (() => {
        const title = popupType === 'all' ? 'נוכחות כללית' : popupType === 'children' ? 'נוכחות ילדים' : 'נוכחות סגל'
        const color = popupType === 'all' ? 'var(--color-accent)' : popupType === 'children' ? 'var(--color-success)' : 'var(--color-warning)'

        const generateText = () => {
          let text = `*${title}*\n\n`
          kindergartens.forEach(kg => {
            const att = getKindergartenAttendance(kg.id)
            const names: string[] = []
            if (popupType === 'all' || popupType === 'children') {
              const presentKids = att ? att.presentChildren.filter(n => kg.children.includes(n)) : []
              names.push(...presentKids)
            }
            if (popupType === 'all' || popupType === 'staff') {
              const presentStaffList = att ? att.presentChildren.filter(n => kg.staff.includes(n)) : []
              names.push(...presentStaffList)
            }
            if (names.length > 0) {
              text += `*${kg.name} (${names.length}):*\n`
              names.forEach(n => { text += `  ${n}\n` })
              text += '\n'
            }
          })
          return text
        }

        return (
          <div onClick={() => setPopupType(null)} style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 9999, padding: '20px',
          }}>
            <div onClick={e => e.stopPropagation()} style={{
              background: 'var(--color-bg-card)', borderRadius: 'var(--radius)',
              border: `2px solid ${color}`, overflow: 'hidden',
              width: '100%', maxWidth: '400px', maxHeight: '80vh', display: 'flex', flexDirection: 'column',
            }}>
              <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--color-border)', textAlign: 'center', background: 'var(--color-bg-card)', position: 'sticky', top: 0, zIndex: 1 }}>
                <span style={{ fontSize: '17px', fontWeight: 800, color }}>{title}</span>
                <button onClick={() => setPopupType(null)} style={{
                  position: 'absolute', top: 10, left: 10, background: 'none', border: 'none',
                  color: 'var(--color-text-secondary)', fontSize: '20px', cursor: 'pointer', lineHeight: 1,
                }}>✕</button>
              </div>
              <div style={{ overflowY: 'auto', flex: 1 }}>
                {kindergartens.map(kg => {
                  const att = getKindergartenAttendance(kg.id)
                  const names: string[] = []
                  if (popupType === 'all' || popupType === 'children') {
                    names.push(...(att ? att.presentChildren.filter(n => kg.children.includes(n)) : []))
                  }
                  if (popupType === 'all' || popupType === 'staff') {
                    names.push(...(att ? att.presentChildren.filter(n => kg.staff.includes(n)) : []))
                  }
                  if (names.length === 0) return null
                  return (
                    <div key={kg.id}>
                      <div style={{ padding: '8px 14px', background: `${color}15`, borderBottom: '1px solid var(--color-border)', fontSize: '13px', fontWeight: 800, color }}>
                        {kg.name} ({names.length})
                      </div>
                      {names.map(name => (
                        <div key={name} style={{ padding: '8px 14px 8px 28px', borderBottom: '1px solid var(--color-border)', fontSize: '12px' }}>
                          {name}
                        </div>
                      ))}
                    </div>
                  )
                })}
              </div>
              <div style={{ padding: '10px', borderTop: '1px solid var(--color-border)', display: 'flex', gap: '8px' }}>
                <button onClick={() => {
                  window.open(`https://wa.me/?text=${encodeURIComponent(generateText())}`, '_blank')
                }} style={{
                  flex: 1, padding: '12px', borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-success)', background: 'rgba(77, 232, 138, 0.08)',
                  color: 'var(--color-success)', fontSize: '14px', fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  fontFamily: 'var(--font-family)',
                }}>
                  <span style={{ fontSize: '18px' }}>💬</span> WhatsApp
                </button>
                <button onClick={() => {
                  const text = generateText().replace(/\*/g, '')
                  const w = window.open('', '_blank')
                  if (w) {
                    w.document.write(`<html dir="rtl"><head><title>${title}</title><style>body{font-family:Arial;padding:40px;direction:rtl}h1{color:#0A1628;border-bottom:2px solid #4DA6E8;padding-bottom:10px}pre{white-space:pre-wrap;font-family:Arial;font-size:14px;line-height:1.8}</style></head><body><h1>${title}</h1><pre>${text}</pre><script>window.print()<\/script></body></html>`)
                    w.document.close()
                  }
                }} style={{
                  flex: 1, padding: '12px', borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)', background: 'var(--color-bg-card)',
                  color: 'var(--color-accent)', fontSize: '14px', fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  fontFamily: 'var(--font-family)',
                }}>
                  <span style={{ fontSize: '18px' }}>🖨️</span> הדפסה
                </button>
              </div>
            </div>
          </div>
        )
      })()}

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

      <button
        onClick={async () => {
          if (!confirm('האם לאפס את כל הנוכחות בגנים?')) return
          await supabase.rpc('secure_clear_kindergarten_attendance', { caller_id: currentUser?.id })
          window.location.reload()
        }}
        style={{
          display: 'block', width: '100%', marginTop: '16px', padding: '14px',
          borderRadius: 'var(--radius)',
          border: '1px solid rgba(232, 77, 77, 0.3)',
          background: 'rgba(232, 77, 77, 0.08)',
          color: 'var(--color-danger)', fontSize: '14px', fontWeight: 700, cursor: 'pointer',
        }}
      >
        איפוס נוכחות
      </button>

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
    </PageLayout>
  )
}
