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
        const mamadPeople = getShelterPeopleCount('Oql3xwJNS6liztw23t2C')
        const noMamadPeople = getShelterPeopleCount('btyaFyyuroj9gEIcBYoz')
        return (
          <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
            <div style={{ flex: 1, background: 'var(--color-bg-card)', border: '2px solid #fff', borderRadius: 'var(--radius)', padding: '12px', textAlign: 'center' }}>
              <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '0 0 6px' }}>נוכחות במקלטים</p>
              <p style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-success)', margin: 0 }}>{shelterPeople}</p>
            </div>
            <div style={{ flex: 1, background: 'var(--color-bg-card)', border: '2px solid #fff', borderRadius: 'var(--radius)', padding: '12px', textAlign: 'center' }}>
              <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '0 0 6px' }}>נוכחות בממ"ד בבית</p>
              <p style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-accent)', margin: 0 }}>{mamadPeople}</p>
            </div>
            <div style={{ flex: 1, background: 'var(--color-bg-card)', border: '2px solid #fff', borderRadius: 'var(--radius)', padding: '12px', textAlign: 'center' }}>
              <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '0 0 6px' }}>נוכחות בבית ללא ממ"ד</p>
              <p style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-danger)', margin: 0 }}>{noMamadPeople}</p>
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
          const checkins = getShelterCheckins(shelter.id)

          return (
            <div
              key={shelter.id}
              onClick={() => navigate(`/dashboard/shelters/${shelter.id}`)}
              style={{
                background: 'var(--color-bg-card)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius)',
                padding: '16px',
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '15px', fontWeight: 800 }}>{shelter.name}</span>
                <span style={{
                  padding: '2px 10px', borderRadius: '10px', fontSize: '11px',
                  fontWeight: 700, color: traffic.color, background: traffic.bg,
                }}>{traffic.label}</span>
              </div>
              <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '32px', fontWeight: 800, color: count > 0 ? traffic.color : 'var(--color-text-secondary)' }}>{count}</span>
                <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginRight: '4px' }}> נפשות</span>
              </div>
              <div style={{ width: '100%', height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden', marginBottom: '10px' }}>
                <div style={{ width: `${barPercent}%`, height: '100%', borderRadius: '3px', background: traffic.color, opacity: 0.3 + (barPercent / 100) * 0.7, transition: 'width 0.3s ease' }} />
              </div>
              {checkins.length > 0 && (
                <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '8px' }}>
                  {checkins.slice(0, 5).map(c => (
                    <div key={c.id} style={{ fontSize: '11px', color: 'var(--color-text-secondary)', padding: '2px 0', display: 'flex', justifyContent: 'space-between' }}>
                      <span>{c.userName}</span>
                      <span>{c.peopleCount} נפשות</span>
                    </div>
                  ))}
                  {checkins.length > 5 && (
                    <p style={{ fontSize: '10px', color: 'var(--color-accent)', margin: '4px 0 0', textAlign: 'center' }}>+{checkins.length - 5} נוספים</p>
                  )}
                </div>
              )}
              <p style={{ fontSize: '10px', color: 'var(--color-text-secondary)', margin: '8px 0 0', textAlign: 'center' }}>מקלט {shelter.number}</p>
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
                padding: '16px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-warning)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-glow)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(232, 197, 77, 0.3)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '15px', fontWeight: 800 }}>{status.name}</span>
                <span style={{ padding: '2px 10px', borderRadius: '10px', fontSize: '11px', fontWeight: 700, color: traffic.color, background: traffic.bg }}>{traffic.label}</span>
              </div>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '32px', fontWeight: 800, color: count > 0 ? 'var(--color-warning)' : 'var(--color-text-secondary)' }}>{count}</span>
                <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginRight: '4px' }}> נפשות</span>
              </div>
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
        onClick={() => { if (confirm('האם לאפס את כל הנוכחות במקלטים?')) clearAllCheckins() }}
        style={{
          display: 'block', width: '100%', marginTop: '16px', padding: '14px',
          borderRadius: 'var(--radius)',
          border: '1px solid rgba(232, 77, 77, 0.3)',
          background: 'rgba(232, 77, 77, 0.08)',
          color: 'var(--color-danger)', fontSize: '14px', fontWeight: 700, cursor: 'pointer',
        }}
      >
        איפוס כלל הנוכחות במקלטים
      </button>

      <ExportButtons
        title="דוח נוכחות במקלטים"
        getText={() => {
          let text = `סה"כ נפשות: ${totalPeople}\n\n`
          regularShelters.forEach(s => {
            const c = getShelterPeopleCount(s.id)
            if (c > 0) text += `${s.name} (מקלט ${s.number}): ${c} נפשות\n`
          })
          return text
        }}
        getTableData={() => ({
          headers: ['מקלט', 'מספר', 'נפשות'],
          rows: regularShelters.map(s => [s.name, String(s.number), String(getShelterPeopleCount(s.id))]),
        })}
      />

      <style>{`
        @media (min-width: 768px) {
          .shelter-dashboard-grid {
            display: grid !important;
            grid-template-columns: repeat(5, 1fr);
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
