import { useNavigate } from 'react-router-dom'
import { regularShelters, specialStatuses, getTrafficLight } from '../data/shelters'
import { useStore } from '../data/store'

export default function Shelters() {
  const navigate = useNavigate()
  const { getShelterPeopleCount } = useStore()

  return (
    <div style={{ paddingTop: '68px', padding: '68px 16px 100px', maxWidth: '1100px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px', textAlign: 'center' }}>מקלטים</h1>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: '32px', textAlign: 'center' }}>
        בחר מקלט לדיווח כניסה
      </p>

      {/* Shelter Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
        gap: '10px',
        marginBottom: '48px',
      }}>
        {regularShelters.map(shelter => {
          const count = getShelterPeopleCount(shelter.id)
          const traffic = getTrafficLight(count)
          return (
            <button
              key={shelter.id}
              onClick={() => navigate(`/shelter/${shelter.id}`)}
              style={{
                background: 'var(--color-bg-card)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                padding: '0',
                cursor: 'pointer',
                overflow: 'hidden',
                transition: 'all 0.2s ease',
                textAlign: 'center',
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
              <div style={{
                width: '100%',
                height: '80px',
                overflow: 'hidden',
                position: 'relative',
              }}>
                <img
                  src={shelter.imageUrl}
                  alt={shelter.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  loading="lazy"
                />
              </div>
              <div style={{
                padding: '6px 8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
              }}>
                {/* Right side: name + number */}
                <div style={{ textAlign: 'right' }}>
                  <p style={{
                    fontSize: '14px',
                    fontWeight: 800,
                    color: 'var(--color-text)',
                    margin: 0,
                  }}>
                    {shelter.name}
                  </p>
                  <p style={{
                    fontSize: '10px',
                    color: 'var(--color-text-secondary)',
                    margin: '1px 0 0',
                    textAlign: 'center',
                  }}>
                    מקלט {shelter.number}
                  </p>
                </div>
                {/* Left side: traffic light + count */}
                <div style={{ textAlign: 'center', minWidth: '40px' }}>
                  <span style={{
                    display: 'inline-block',
                    padding: '1px 7px',
                    borderRadius: '10px',
                    fontSize: '10px',
                    fontWeight: 700,
                    color: traffic.color,
                    background: traffic.bg,
                  }}>
                    {traffic.label}
                  </span>
                  <p style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    color: traffic.color,
                    margin: '2px 0 0',
                  }}>
                    {count}
                  </p>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Special Statuses */}
      <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '16px', color: 'var(--color-accent)' }}>
        סטטוס אישי
      </h2>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '12px',
      }}>
        {specialStatuses.map(status => {
          const count = getShelterPeopleCount(status.id)
          return (
            <button
              key={status.id}
              onClick={() => navigate(`/shelter/${status.id}`)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '16px',
                background: 'var(--color-bg-card)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius)',
                cursor: 'pointer',
                color: 'var(--color-text)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--color-accent)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(77, 166, 232, 0.2)'
              }}
            >
              <img
                src={status.imageUrl}
                alt={status.name}
                style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }}
              />
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontWeight: 700, fontSize: '14px', margin: 0 }}>{status.name}</p>
                {count > 0 && (
                  <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '2px 0 0' , textAlign: 'center'}}>
                    {count} נרשמו
                  </p>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
