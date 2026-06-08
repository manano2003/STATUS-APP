import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getRegularShelters, getSpecialStatuses, getTrafficLight } from '../data/shelters'
import { useStore } from '../data/store'
import PageLayout from '../components/PageLayout'
import ExportButtons from '../components/ExportButtons'

const MAX_CAPACITY = 50

export default function DashboardShelters() {
  const navigate = useNavigate()
  const { getShelterPeopleCount, getShelterCheckins, clearAllCheckins } = useStore()
  const [search, setSearch] = useState('')
  const [popupShelterId, setPopupShelterId] = useState<string | null>(null)
  const [showResetPopup, setShowResetPopup] = useState(false)
  const regularShelters = getRegularShelters()
  const specialStatuses = getSpecialStatuses()

  const totalPeople = [...regularShelters, ...specialStatuses].reduce((sum, s) => sum + getShelterPeopleCount(s.id), 0)

  const filteredShelters = [...regularShelters]
    .filter(s => {
      if (!search.trim()) return true
      const q = search.trim().toLowerCase()
      return s.name.toLowerCase().includes(q) || String(s.number).includes(q)
    })
    .sort((a, b) => getShelterPeopleCount(b.id) - getShelterPeopleCount(a.id))

  return (
    <PageLayout title="🏛️ נוכחות במקלטים" subtitle={`סה"כ ${totalPeople} נפשות במקלטים`} backTo="/dashboard">

      {/* Stats boxes */}
      {(() => {
        const shelterPeople = regularShelters.reduce((sum, s) => sum + getShelterPeopleCount(s.id), 0)
        const mamadShelter = specialStatuses.find(s => s.name.includes('ממ"ד בבית'))
        const noMamadShelter = specialStatuses.find(s => s.name.includes('ללא ממ"ד'))
        const mamadId = mamadShelter?.id || ''
        const noMamadId = noMamadShelter?.id || ''
        const mamadPeople = mamadId ? getShelterPeopleCount(mamadId) : 0
        const noMamadPeople = noMamadId ? getShelterPeopleCount(noMamadId) : 0
        return (
          <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
            <div onClick={() => setPopupShelterId('all-shelters')} style={{ flex: 1, background: 'var(--color-bg-card)', border: '2px solid #fff', borderRadius: 'var(--radius)', padding: '12px', textAlign: 'center', cursor: 'pointer' }}>
              <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '0 0 6px' }}>נוכחות במקלטים</p>
              <p style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-success)', margin: 0 }}>{shelterPeople}</p>
            </div>
            <div onClick={() => mamadId && setPopupShelterId(mamadId)} style={{ flex: 1, background: 'var(--color-bg-card)', border: '2px solid #fff', borderRadius: 'var(--radius)', padding: '12px', textAlign: 'center', cursor: 'pointer' }}>
              <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '0 0 6px' }}>נוכחות בממ"ד בבית</p>
              <p style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-accent)', margin: 0 }}>{mamadPeople}</p>
            </div>
            <div onClick={() => noMamadId && setPopupShelterId(noMamadId)} style={{ flex: 1, background: 'var(--color-bg-card)', border: '2px solid #fff', borderRadius: 'var(--radius)', padding: '12px', textAlign: 'center', cursor: 'pointer' }}>
              <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '0 0 6px' }}>נוכחות בבית ללא ממ"ד</p>
              <p style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-danger)', margin: 0 }}>{noMamadPeople}</p>
            </div>
          </div>
        )
      })()}

      {/* Popup for shelters / mamad / no mamad */}
      {popupShelterId && (() => {
        const isAllShelters = popupShelterId === 'all-shelters'
        const allShelterCheckins = isAllShelters ? regularShelters.flatMap(s => getShelterCheckins(s.id).map(c => ({ ...c, shelterName: s.name, shelterNumber: s.number }))) : []
        const checkins = isAllShelters ? [] : getShelterCheckins(popupShelterId)
        const mamadS = specialStatuses.find(s => s.name.includes('ממ"ד בבית'))
        const isMamad = popupShelterId === mamadS?.id
        const title = isAllShelters ? 'נוכחות במקלטים' : isMamad ? 'נוכחות בממ"ד בבית' : 'נוכחות בבית ללא ממ"ד'
        const color = isAllShelters ? 'var(--color-success)' : isMamad ? 'var(--color-accent)' : 'var(--color-danger)'
        return (
          <div
            onClick={() => setPopupShelterId(null)}
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 9999, padding: '20px',
            }}
          >
            <div onClick={e => e.stopPropagation()} style={{
              background: 'var(--color-bg-card)', borderRadius: 'var(--radius)',
              border: `2px solid ${color}`, overflow: 'hidden',
              width: '100%', maxWidth: '400px', maxHeight: '80vh', overflowY: 'auto',
            }}>
              <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--color-border)', textAlign: 'center', position: 'sticky', top: 0, zIndex: 1, background: 'var(--color-bg-card)' }}>
                <span style={{ fontSize: '17px', fontWeight: 800, color }}>{title}</span>
                <span style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginRight: '8px' }}>({isAllShelters ? allShelterCheckins.length : checkins.length})</span>
                <button onClick={() => setPopupShelterId(null)} style={{
                  position: 'absolute', top: 10, left: 10, background: 'none', border: 'none',
                  color: 'var(--color-text-secondary)', fontSize: '20px', cursor: 'pointer', lineHeight: 1,
                }}>✕</button>
              </div>
              {isAllShelters ? (
                allShelterCheckins.length === 0 ? (
                  <p style={{ padding: '20px', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '13px' }}>אין נוכחים</p>
                ) : regularShelters.filter(s => getShelterPeopleCount(s.id) > 0).map(s => {
                  const sc = getShelterCheckins(s.id)
                  return (
                    <div key={s.id}>
                      <div style={{ padding: '8px 14px', background: 'rgba(77, 232, 138, 0.08)', borderBottom: '1px solid var(--color-border)', fontSize: '13px', fontWeight: 800, color: 'var(--color-success)' }}>
                        {s.number}. {s.name} ({getShelterPeopleCount(s.id)})
                      </div>
                      {sc.map(c => (
                        <div key={c.id} style={{ display: 'flex', alignItems: 'center', padding: '8px 14px 8px 28px', borderBottom: '1px solid var(--color-border)', fontSize: '12px' }}>
                          <div style={{ flex: 1 }}>
                            <span style={{ fontWeight: 600 }}>{c.userName}</span>
                            <span style={{ color: 'var(--color-text-secondary)', marginRight: '6px', fontSize: '11px' }}>{c.userHouseNumber ? `בית ${c.userHouseNumber}` : ''}</span>
                          </div>
                          <span style={{ fontWeight: 700, color: 'var(--color-success)' }}>{c.peopleCount}</span>
                        </div>
                      ))}
                    </div>
                  )
                })
              ) : checkins.length === 0 ? (
                <p style={{ padding: '20px', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '13px' }}>אין נוכחים</p>
              ) : checkins.map(c => (
                <div key={c.id} style={{
                  display: 'flex', alignItems: 'center', padding: '10px 14px',
                  borderBottom: '1px solid var(--color-border)', fontSize: '13px',
                }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '14px', fontWeight: 700, margin: 0, color: 'var(--color-text)' }}>{c.userName}</p>
                    <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', margin: '2px 0 0' }}>
                      {c.userHouseNumber ? `בית ${c.userHouseNumber}` : ''}{c.userPhone ? ` | ${c.userPhone}` : ''}
                    </p>
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: 800, color }}>{c.peopleCount}</span>
                </div>
              ))}
              {/* WhatsApp button */}
              <div style={{ padding: '12px', borderTop: '1px solid var(--color-border)' }}>
                <button
                  onClick={() => {
                    const items = isAllShelters ? allShelterCheckins : checkins
                    const total = items.reduce((s: number, c: any) => s + c.peopleCount, 0)
                    let text = `*${title}*\nסה"כ: ${total} נפשות\n\n`
                    if (isAllShelters) {
                      regularShelters.filter(s => getShelterPeopleCount(s.id) > 0).forEach(s => {
                        text += `*${s.number}. ${s.name}: ${getShelterPeopleCount(s.id)} נפשות*\n`
                        getShelterCheckins(s.id).forEach(c => {
                          text += `  ${c.userName} | ${c.userPhone || '—'} | בית ${c.userHouseNumber || '—'} | ${c.peopleCount}\n`
                        })
                        text += '\n'
                      })
                    } else {
                      text += `שם | טלפון | בית | נפשות\n`
                      text += `──────────────────\n`
                      checkins.forEach(c => {
                        text += `${c.userName} | ${c.userPhone || '—'} | ${c.userHouseNumber || '—'} | ${c.peopleCount}\n`
                      })
                    }
                    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
                  }}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-success)', background: 'rgba(77, 232, 138, 0.08)',
                    color: 'var(--color-success)', fontSize: '14px', fontWeight: 700, cursor: 'pointer',
                    fontFamily: 'var(--font-family)',
                  }}
                >
                  <span style={{ fontSize: '18px' }}>💬</span>
                  שלח בוואטסאפ
                </button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="חיפוש לפי שם או מספר מקלט..."
        style={{
          width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--color-border)', background: 'var(--color-bg-secondary)',
          color: 'var(--color-text)', fontSize: '14px', marginBottom: '12px', outline: 'none',
        }}
      />

      {/* Desktop cards */}
      <div className="shelter-dashboard-grid" style={{ display: 'none' }}>
        {filteredShelters.map(shelter => {
          const count = getShelterPeopleCount(shelter.id)
          const traffic = getTrafficLight(count)
          const barPercent = Math.min((count / MAX_CAPACITY) * 100, 100)

          return (
            <div
              key={shelter.id}
              onClick={() => navigate(`/dashboard/shelters/${shelter.id}`)}
              style={{
                background: 'var(--color-bg-card)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius)',
                padding: '10px 8px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--color-accent)'
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = 'var(--shadow-glow)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(77, 166, 232, 0.2)'
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <p style={{ fontSize: '12px', fontWeight: 800, margin: '0 0 4px', textAlign: 'center' }}>{shelter.name}</p>
              <div style={{ textAlign: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '24px', fontWeight: 800, color: count > 0 ? traffic.color : 'var(--color-text-secondary)' }}>{count}</span>
              </div>
              <div style={{ width: '100%', height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden', marginBottom: '4px' }}>
                <div style={{ width: `${barPercent}%`, height: '100%', borderRadius: '2px', background: traffic.color, opacity: 0.3 + (barPercent / 100) * 0.7, transition: 'width 0.3s ease' }} />
              </div>
              <span style={{ display: 'block', textAlign: 'center', padding: '1px 0', fontSize: '9px', fontWeight: 700, color: traffic.color }}>{traffic.label}</span>
            </div>
          )
        })}

        {/* Special statuses in desktop grid */}
        {specialStatuses.map(status => {
          const count = getShelterPeopleCount(status.id)
          const traffic = getTrafficLight(count)
          return (
            <div
              key={status.id}
              onClick={() => navigate(`/dashboard/shelters/${status.id}`)}
              style={{
                background: 'var(--color-bg-card)',
                border: '1px solid rgba(232, 197, 77, 0.3)',
                borderRadius: 'var(--radius)',
                padding: '10px 8px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-warning)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-glow)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(232, 197, 77, 0.3)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
            >
              <p style={{ fontSize: '12px', fontWeight: 800, margin: '0 0 4px', textAlign: 'center' }}>{status.name}</p>
              <div style={{ textAlign: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '24px', fontWeight: 800, color: count > 0 ? 'var(--color-warning)' : 'var(--color-text-secondary)' }}>{count}</span>
              </div>
              <span style={{ display: 'block', textAlign: 'center', fontSize: '9px', fontWeight: 700, color: traffic.color }}>{traffic.label}</span>
            </div>
          )
        })}
      </div>

      {/* Mobile rows - shelters */}
      <div className="shelter-dashboard-rows" style={{
        background: 'var(--color-bg-card)',
        borderRadius: 'var(--radius)',
        border: '1px solid var(--color-border)',
        overflow: 'hidden',
      }}>
        {filteredShelters.map(shelter => {
          const count = getShelterPeopleCount(shelter.id)
          const traffic = getTrafficLight(count)
          const barPercent = Math.min((count / MAX_CAPACITY) * 100, 100)
          return (
            <div key={shelter.id} onClick={() => navigate(`/dashboard/shelters/${shelter.id}`)} style={{
              padding: '12px 14px', borderBottom: '1px solid var(--color-border)', cursor: 'pointer', transition: 'background 0.15s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(77, 166, 232, 0.05)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', minWidth: '20px' }}>{shelter.number}</span>
                <span style={{ fontSize: '13px', fontWeight: 600, flex: 1 }}>{shelter.name}</span>
                <span style={{ padding: '1px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: 700, color: traffic.color, background: traffic.bg }}>{traffic.label}</span>
                <span style={{ fontSize: '14px', fontWeight: 800, color: count > 0 ? 'var(--color-danger)' : 'var(--color-success)', minWidth: '28px', textAlign: 'left' }}>{count}</span>
              </div>
              <div style={{ width: '100%', height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                <div style={{ width: `${barPercent}%`, height: '100%', borderRadius: '3px', background: traffic.color, opacity: 0.3 + (barPercent / 100) * 0.7, transition: 'width 0.3s ease' }} />
              </div>
            </div>
          )
        })}
      </div>

      {/* Mobile rows - special statuses (same format as shelters) */}
      <div className="shelter-dashboard-rows">
        <h2 style={{ fontSize: '16px', fontWeight: 700, marginTop: '24px', marginBottom: '8px', color: 'var(--color-accent)' }}>
          סטטוס אישי
        </h2>
        <div style={{
          background: 'var(--color-bg-card)',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--color-border)',
          overflow: 'hidden',
        }}>
          {specialStatuses.map(status => {
            const count = getShelterPeopleCount(status.id)
            const traffic = getTrafficLight(count)
            const barPercent = Math.min((count / MAX_CAPACITY) * 100, 100)
            return (
              <div key={status.id} onClick={() => navigate(`/dashboard/shelters/${status.id}`)} style={{
                padding: '12px 14px', borderBottom: '1px solid var(--color-border)', cursor: 'pointer', transition: 'background 0.15s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(77, 166, 232, 0.05)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', minWidth: '20px' }}>{status.number}</span>
                  <span style={{ fontSize: '13px', fontWeight: 600, flex: 1 }}>{status.name}</span>
                  <span style={{ padding: '1px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: 700, color: traffic.color, background: traffic.bg }}>{traffic.label}</span>
                  <span style={{ fontSize: '14px', fontWeight: 800, color: count > 0 ? 'var(--color-danger)' : 'var(--color-success)', minWidth: '28px', textAlign: 'left' }}>{count}</span>
                </div>
                <div style={{ width: '100%', height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                  <div style={{ width: `${barPercent}%`, height: '100%', borderRadius: '3px', background: traffic.color, opacity: 0.3 + (barPercent / 100) * 0.7, transition: 'width 0.3s ease' }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <button
        onClick={() => setShowResetPopup(true)}
        style={{
          display: 'block', width: '100%', marginTop: '16px', padding: '14px',
          borderRadius: 'var(--radius)',
          border: '1px solid rgba(232, 77, 77, 0.3)',
          background: 'rgba(232, 77, 77, 0.08)',
          color: 'var(--color-danger)', fontSize: '14px', fontWeight: 700, cursor: 'pointer',
          fontFamily: 'var(--font-family)',
        }}
      >
        איפוס כלל הנוכחות במקלטים
      </button>

      {/* Reset confirmation popup */}
      {showResetPopup && (
        <div onClick={() => setShowResetPopup(false)} style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: '20px',
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: 'var(--color-bg-card)', borderRadius: 'var(--radius)',
            border: '2px solid var(--color-danger)', padding: '28px 24px', textAlign: 'center',
            width: '100%', maxWidth: '360px',
          }}>
            <p style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-danger)', margin: '0 0 20px' }}>
              האם אירוע אמת נגמר?
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button onClick={() => { clearAllCheckins(true); setShowResetPopup(false) }} style={{
                padding: '14px', borderRadius: 'var(--radius-sm)',
                background: 'var(--color-accent)', color: '#fff', border: 'none',
                fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-family)',
              }}>
                אפס ושמור בהיסטוריה
              </button>
              <button onClick={() => { clearAllCheckins(false); setShowResetPopup(false) }} style={{
                padding: '14px', borderRadius: 'var(--radius-sm)',
                background: 'transparent', color: 'var(--color-text-secondary)',
                border: '1px solid var(--color-border)',
                fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-family)',
              }}>
                אפס ואל תשמור בהיסטוריה
              </button>
            </div>
          </div>
        </div>
      )}

      <ExportButtons
        title="דוח נוכחות במקלטים"
        getText={() => {
          let text = `סה"כ נפשות: ${totalPeople}\n\n`
          text += `--- מקלטים ---\n`
          regularShelters.forEach(s => {
            const c = getShelterPeopleCount(s.id)
            text += `${s.number}. ${s.name}: ${c} נפשות\n`
          })
          text += `\n--- סטטוס אישי ---\n`
          specialStatuses.forEach(s => {
            const c = getShelterPeopleCount(s.id)
            text += `${s.number}. ${s.name}: ${c} נפשות\n`
          })
          return text
        }}
        getTableData={() => ({
          headers: ['מזהה', 'שם', 'נוכחים'],
          rows: [
            ...regularShelters.map(s => [String(s.number), s.name, String(getShelterPeopleCount(s.id))]),
            ...specialStatuses.map(s => [String(s.number), s.name, String(getShelterPeopleCount(s.id))]),
          ],
        })}
      />

      <style>{`
        @media (min-width: 768px) {
          .shelter-dashboard-grid {
            display: grid !important;
            grid-template-columns: repeat(8, 1fr);
            gap: 14px;
            margin-bottom: 16px;
          }
          .shelter-dashboard-rows {
            display: none !important;
          }
        }
      `}</style>
    </PageLayout>
  )
}
