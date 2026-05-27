import { useParams, useNavigate } from 'react-router-dom'
import { getShelterById, getTrafficLight } from '../data/shelters'
import { useStore } from '../data/store'
import PageLayout from '../components/PageLayout'

export default function ShelterReportDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getShelterCheckins, getShelterPeopleCount } = useStore()

  const shelter = id ? getShelterById(id) : undefined
  if (!shelter) return <div style={{ paddingTop: '100px', textAlign: 'center' }}>מקלט לא נמצא</div>

  const checkins = getShelterCheckins(shelter.id)
  const count = getShelterPeopleCount(shelter.id)
  const traffic = getTrafficLight(count)

  return (
    <PageLayout title={shelter.name} subtitle={`מקלט ${shelter.number}`} backTo="/dashboard/shelters">

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <img src={shelter.imageUrl} alt={shelter.name}
          style={{ width: '56px', height: '56px', borderRadius: '8px', objectFit: 'cover' }} />
        <div style={{ flex: 1 }} />
        <div style={{ textAlign: 'center' }}>
          <span style={{
            padding: '3px 12px', borderRadius: '12px', fontSize: '12px',
            fontWeight: 700, color: traffic.color, background: traffic.bg,
          }}>
            {traffic.label}
          </span>
          <p style={{ fontSize: '18px', fontWeight: 800, color: traffic.color, margin: '4px 0 0' }}>{count}</p>
        </div>
      </div>

      <div style={{
        background: 'var(--color-bg-card)',
        borderRadius: 'var(--radius)',
        border: '1px solid var(--color-border)',
        overflow: 'hidden',
      }}>
        {checkins.length === 0 ? (
          <p style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '13px' }}>
            אין נרשמים במקלט זה
          </p>
        ) : (
          <>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1.5fr 1fr 55px 55px',
              padding: '10px 12px',
              borderBottom: '1px solid var(--color-border)',
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--color-text-secondary)',
            }}>
              <span>שם</span>
              <span>טלפון</span>
              <span style={{ textAlign: 'center' }}>בית</span>
              <span style={{ textAlign: 'center' }}>נפשות</span>
            </div>
            {checkins.map(c => (
              <div
                key={c.id}
                onClick={() => navigate(`/dashboard/user/${c.userId}`)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1.5fr 1fr 55px 55px',
                  padding: '10px 12px',
                  borderBottom: '1px solid var(--color-border)',
                  fontSize: '12px',
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(77, 166, 232, 0.05)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <span style={{ fontWeight: 600 }}>
                  {c.userName}
                  {c.isGuest && (
                    <span style={{
                      marginRight: '4px', fontSize: '9px', padding: '0 5px',
                      borderRadius: '6px', background: 'rgba(232, 197, 77, 0.15)',
                      color: 'var(--color-warning)',
                    }}>אורח</span>
                  )}
                </span>
                <span style={{ direction: 'ltr', textAlign: 'right', fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                  {c.userPhone ? `+972${c.userPhone}` : '—'}
                </span>
                <span style={{ textAlign: 'center' }}>{c.userHouseNumber || '—'}</span>
                <span style={{ textAlign: 'center', fontWeight: 700 }}>{c.peopleCount}</span>
              </div>
            ))}
            <div style={{
              display: 'grid', gridTemplateColumns: '1.5fr 1fr 55px 55px',
              padding: '10px 12px', fontSize: '12px', fontWeight: 800, color: 'var(--color-accent)',
            }}>
              <span>סה"כ</span>
              <span />
              <span />
              <span style={{ textAlign: 'center' }}>{count}</span>
            </div>
          </>
        )}
      </div>

    </PageLayout>
  )
}
