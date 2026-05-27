import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getRegularShelters, getSpecialStatuses, getTrafficLight, getShelterById } from '../data/shelters'
import { useStore } from '../data/store'
import PageLayout from '../components/PageLayout'

export default function Shelters() {
  const navigate = useNavigate()
  const { getShelterPeopleCount, currentUser, getUserCheckin, removeCheckin, lastCheckinUserId } = useStore()
  const [showConfirm, setShowConfirm] = useState(false)

  const regularShelters = getRegularShelters()
  const specialStatuses = getSpecialStatuses()
  const effectiveUserId = currentUser?.id ?? lastCheckinUserId
  const userCheckin = effectiveUserId ? getUserCheckin(effectiveUserId) : undefined
  const shelterName = userCheckin ? getShelterById(userCheckin.shelterId)?.name ?? userCheckin.shelterId : ''

  return (
    <PageLayout title="מקלטים" subtitle="בחר מקלט לדיווח כניסה">

      {userCheckin && (
        <div style={{
          background: 'rgba(77, 166, 232, 0.1)',
          border: '1px solid var(--color-accent)',
          borderRadius: 'var(--radius)',
          padding: '12px 16px',
          marginBottom: '20px',
          textAlign: 'center',
        }}>
          <p style={{ margin: '0 0 10px', fontSize: '14px', color: 'var(--color-text)' }}>
            נמצא/ת כרגע ב: <strong>{shelterName}</strong>
          </p>
          {!showConfirm ? (
            <button
              onClick={() => setShowConfirm(true)}
              style={{
                background: '#E84D4D',
                color: '#fff',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                padding: '10px 32px',
                fontSize: '15px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              יצאתי מהמקלט
            </button>
          ) : (
            <div>
              <p style={{ margin: '0 0 10px', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                בטוח שיצאת מ{shelterName}?
              </p>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <button
                  onClick={() => {
                    removeCheckin(effectiveUserId!)
                    setShowConfirm(false)
                  }}
                  style={{
                    background: '#E84D4D',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    padding: '8px 24px',
                    fontSize: '14px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  כן, יצאתי
                </button>
                <button
                  onClick={() => setShowConfirm(false)}
                  style={{
                    background: 'transparent',
                    color: 'var(--color-text-secondary)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '8px 24px',
                    fontSize: '14px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  ביטול
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Shelter Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
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
                aspectRatio: '16 / 9',
                overflow: 'hidden',
              }}>
                <img
                  src={shelter.imageUrl}
                  alt={shelter.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }}
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
    </PageLayout>
  )
}
