import { useState } from 'react'
import { regularShelters, getTrafficLight } from '../data/shelters'
import { useStore } from '../data/store'
import BackButton from '../components/BackButton'

export default function AdminShelters() {
  const { getShelterPeopleCount, getShelterCheckins } = useStore()
  const [expandedShelterId, setExpandedShelterId] = useState<string | null>(null)

  const totalPeople = regularShelters.reduce((sum, s) => sum + getShelterPeopleCount(s.id), 0)

  return (
    <div style={{ paddingTop: '80px', padding: '80px 24px 24px', maxWidth: '1000px', margin: '0 auto' }}>
      <BackButton />
      <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px' , textAlign: 'center'}}>סיכום מקלטים</h1>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: '24px' , textAlign: 'center'}}>
        סה"כ {totalPeople} אנשים במקלטים
      </p>

      {/* Summary Table */}
      <div style={{
        background: 'var(--color-bg-card)',
        borderRadius: 'var(--radius)',
        border: '1px solid var(--color-border)',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '50px 2fr 100px 100px',
          padding: '12px 16px',
          borderBottom: '1px solid var(--color-border)',
          fontSize: '13px',
          fontWeight: 700,
          color: 'var(--color-text-secondary)',
        }}>
          <span>#</span>
          <span>מקלט</span>
          <span style={{ textAlign: 'center' }}>אנשים</span>
          <span style={{ textAlign: 'center' }}>מצב</span>
        </div>

        {/* Rows */}
        {regularShelters.map(shelter => {
          const count = getShelterPeopleCount(shelter.id)
          const traffic = getTrafficLight(count)
          const checkins = getShelterCheckins(shelter.id)
          const isExpanded = expandedShelterId === shelter.id

          return (
            <div key={shelter.id}>
              <div
                onClick={() => setExpandedShelterId(isExpanded ? null : shelter.id)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '50px 2fr 100px 100px',
                  padding: '12px 16px',
                  borderBottom: '1px solid var(--color-border)',
                  cursor: 'pointer',
                  fontSize: '14px',
                  transition: 'background 0.15s',
                  background: isExpanded ? 'rgba(77, 166, 232, 0.05)' : 'transparent',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(77, 166, 232, 0.05)'}
                onMouseLeave={e => {
                  if (!isExpanded) e.currentTarget.style.background = 'transparent'
                }}
              >
                <span style={{ color: 'var(--color-text-secondary)' }}>{shelter.number}</span>
                <span style={{ fontWeight: 600 }}>{shelter.name}</span>
                <span style={{ textAlign: 'center', fontWeight: 800, color: traffic.color }}>
                  {count}
                </span>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <span style={{
                    padding: '2px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 700,
                    color: traffic.color,
                    background: traffic.bg,
                  }}>
                    {traffic.label}
                  </span>
                </div>
              </div>

              {/* Drill-down */}
              {isExpanded && (
                <div style={{
                  padding: '16px 24px',
                  borderBottom: '1px solid var(--color-border)',
                  background: 'rgba(77, 166, 232, 0.03)',
                }}>
                  {checkins.length === 0 ? (
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px', textAlign: 'center' }}>
                      אין נרשמים במקלט זה
                    </p>
                  ) : (
                    <>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '2fr 1fr 1.5fr 1fr',
                        padding: '8px 0',
                        fontSize: '12px',
                        fontWeight: 700,
                        color: 'var(--color-text-secondary)',
                        borderBottom: '1px solid var(--color-border)',
                      }}>
                        <span>שם</span>
                        <span>מספר בית</span>
                        <span>טלפון</span>
                        <span style={{ textAlign: 'center' }}>נפשות</span>
                      </div>
                      {checkins.map(c => (
                        <div key={c.id} style={{
                          display: 'grid',
                          gridTemplateColumns: '2fr 1fr 1.5fr 1fr',
                          padding: '8px 0',
                          fontSize: '13px',
                          borderBottom: '1px solid rgba(77, 166, 232, 0.1)',
                        }}>
                          <span>{c.userName}</span>
                          <span>{c.userHouseNumber || '—'}</span>
                          <span style={{ direction: 'ltr', textAlign: 'right' }}>
                            {c.userPhone ? `+972${c.userPhone}` : '—'}
                          </span>
                          <span style={{ textAlign: 'center', fontWeight: 700 }}>{c.peopleCount}</span>
                        </div>
                      ))}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '2fr 1fr 1.5fr 1fr',
                        padding: '10px 0 0',
                        fontSize: '13px',
                        fontWeight: 800,
                        color: 'var(--color-accent)',
                      }}>
                        <span>סה"כ</span>
                        <span />
                        <span />
                        <span style={{ textAlign: 'center' }}>{count}</span>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
