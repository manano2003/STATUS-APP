import { useNavigate } from 'react-router-dom'
import { regularShelters, specialStatuses, getTrafficLight } from '../data/shelters'
import { useStore } from '../data/store'
import BackButton from '../components/BackButton'
import ExportButtons from '../components/ExportButtons'

const MAX_CAPACITY = 50

export default function DashboardShelters() {
  const navigate = useNavigate()
  const { getShelterPeopleCount, clearAllCheckins } = useStore()

  const totalPeople = [...regularShelters, ...specialStatuses].reduce((sum, s) => sum + getShelterPeopleCount(s.id), 0)

  return (
    <div style={{ paddingTop: '68px', padding: '68px 16px 100px', maxWidth: '600px', margin: '0 auto' }}>
      <BackButton to="/dashboard" />

      <h1 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '4px', textAlign: 'center' }}>
        🏛️ נוכחות במקלטים
      </h1>
      <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px', marginBottom: '16px', textAlign: 'center' }}>
        סה"כ <span style={{ color: totalPeople > 0 ? 'var(--color-danger)' : 'var(--color-success)', fontWeight: 800 }}>{totalPeople}</span> נפשות במקלטים
      </p>

      <div style={{
        background: 'var(--color-bg-card)',
        borderRadius: 'var(--radius)',
        border: '1px solid var(--color-border)',
        overflow: 'hidden',
      }}>
        {regularShelters.map(shelter => {
          const count = getShelterPeopleCount(shelter.id)
          const traffic = getTrafficLight(count)
          const barPercent = Math.min((count / MAX_CAPACITY) * 100, 100)

          return (
            <div
              key={shelter.id}
              onClick={() => navigate(`/dashboard/shelters/${shelter.id}`)}
              style={{
                padding: '12px 14px',
                borderBottom: '1px solid var(--color-border)',
                cursor: 'pointer',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(77, 166, 232, 0.05)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {/* Top row: number, name, status, count */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '6px',
              }}>
                <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', minWidth: '20px' }}>
                  {shelter.number}
                </span>
                <span style={{ fontSize: '13px', fontWeight: 600, flex: 1 }}>{shelter.name}</span>
                <span style={{
                  padding: '1px 8px', borderRadius: '10px', fontSize: '10px',
                  fontWeight: 700, color: traffic.color, background: traffic.bg,
                }}>
                  {traffic.label}
                </span>
                <span style={{ fontSize: '14px', fontWeight: 800, color: count > 0 ? 'var(--color-danger)' : 'var(--color-success)', minWidth: '28px', textAlign: 'left' }}>
                  {count}
                </span>
              </div>

              {/* Progress bar */}
              <div style={{
                width: '100%',
                height: '6px',
                borderRadius: '3px',
                background: 'rgba(255,255,255,0.06)',
                overflow: 'hidden',
              }}>
                <div style={{
                  width: `${barPercent}%`,
                  height: '100%',
                  borderRadius: '3px',
                  background: traffic.color,
                  opacity: 0.3 + (barPercent / 100) * 0.7,
                  transition: 'width 0.3s ease, opacity 0.3s ease',
                }} />
              </div>
            </div>
          )
        })}
      </div>

      {/* Special Statuses */}
      <h2 style={{ fontSize: '16px', fontWeight: 700, marginTop: '24px', marginBottom: '8px', color: 'var(--color-accent)' }}>
        סטטוס אישי
      </h2>
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '12px',
        flexWrap: 'wrap',
      }}>
        {specialStatuses.map(s => {
          const c = getShelterPeopleCount(s.id)
          return (
            <div key={s.id} style={{
              flex: 1,
              minWidth: '90px',
              padding: '8px 10px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--color-bg-card)',
              border: '1px solid var(--color-border)',
              textAlign: 'center',
            }}>
              <p style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-accent)', margin: '0 0 2px' , textAlign: 'center'}}>{c}</p>
              <p style={{ fontSize: '10px', color: 'var(--color-text-secondary)', margin: 0 , textAlign: 'center'}}>{s.name}</p>
            </div>
          )
        })}
      </div>
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
            <div
              key={status.id}
              onClick={() => navigate(`/dashboard/shelters/${status.id}`)}
              style={{
                padding: '12px 14px',
                borderBottom: '1px solid var(--color-border)',
                cursor: 'pointer',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(77, 166, 232, 0.05)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '6px',
              }}>
                <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', minWidth: '20px' }}>
                  {status.number}
                </span>
                <span style={{ fontSize: '13px', fontWeight: 600, flex: 1 }}>{status.name}</span>
                <span style={{
                  padding: '1px 8px', borderRadius: '10px', fontSize: '10px',
                  fontWeight: 700, color: traffic.color, background: traffic.bg,
                }}>
                  {traffic.label}
                </span>
                <span style={{ fontSize: '14px', fontWeight: 800, color: count > 0 ? 'var(--color-danger)' : 'var(--color-success)', minWidth: '28px', textAlign: 'left' }}>
                  {count}
                </span>
              </div>
              <div style={{
                width: '100%', height: '6px', borderRadius: '3px',
                background: 'rgba(255,255,255,0.06)', overflow: 'hidden',
              }}>
                <div style={{
                  width: `${barPercent}%`, height: '100%', borderRadius: '3px',
                  background: traffic.color,
                  opacity: 0.3 + (barPercent / 100) * 0.7,
                  transition: 'width 0.3s ease, opacity 0.3s ease',
                }} />
              </div>
            </div>
          )
        })}
      </div>

      <button
        onClick={() => { if (confirm('האם לאפס את כל הנוכחות במקלטים?')) clearAllCheckins() }}
        style={{
          display: 'block',
          width: '100%',
          marginTop: '16px',
          padding: '14px',
          borderRadius: 'var(--radius)',
          border: '1px solid rgba(232, 77, 77, 0.3)',
          background: 'rgba(232, 77, 77, 0.08)',
          color: 'var(--color-danger)',
          fontSize: '14px',
          fontWeight: 700,
          cursor: 'pointer',
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
    </div>
  )
}
