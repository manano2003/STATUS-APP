import { useParams } from 'react-router-dom'
import { getShelterById } from '../data/shelters'
import { useStore } from '../data/store'
import BackButton from '../components/BackButton'

export default function HistoryShelterDay() {
  const { id, date } = useParams<{ id: string; date: string }>()
  const { shelterHistory } = useStore()

  const shelter = id ? getShelterById(id) : undefined
  const snapshot = shelterHistory.find(s => s.shelterId === id && s.date === date)

  if (!shelter) return <div style={{ paddingTop: '100px', textAlign: 'center' }}>מקלט לא נמצא</div>

  const formatDate = (d: string) => {
    const parts = d.split('-')
    return `${parts[2]}/${parts[1]}/${parts[0]}`
  }

  const totalPeople = snapshot?.checkins.reduce((sum, c) => sum + c.peopleCount, 0) ?? 0

  return (
    <div style={{ paddingTop: '68px', padding: '68px 16px 100px', maxWidth: '500px', margin: '0 auto' }}>
      <BackButton to={`/dashboard/history/shelters/${shelter.id}`} />

      <h1 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '4px', textAlign: 'center' }}>
        {shelter.name}
      </h1>
      <p style={{ color: 'var(--color-accent)', fontSize: '16px', fontWeight: 700, marginBottom: '4px', textAlign: 'center' }}>
        {date ? formatDate(date) : ''}
      </p>
      <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px', marginBottom: '16px', textAlign: 'center' }}>
        {snapshot ? `${snapshot.checkins.length} נרשמו | ${totalPeople} נפשות` : 'אין נתונים ליום זה'}
      </p>

      <div style={{
        background: 'var(--color-bg-card)', borderRadius: 'var(--radius)',
        border: '1px solid var(--color-border)', overflow: 'hidden',
      }}>
        {!snapshot || snapshot.checkins.length === 0 ? (
          <p style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '13px' }}>
            לא דווחה נוכחות ביום זה
          </p>
        ) : (
          <>
            <div style={{
              display: 'grid', gridTemplateColumns: '1.5fr 1fr 60px 60px',
              padding: '10px 14px', borderBottom: '1px solid var(--color-border)',
              fontSize: '11px', fontWeight: 700, color: 'var(--color-text-secondary)',
            }}>
              <span>שם</span>
              <span>טלפון</span>
              <span style={{ textAlign: 'center' }}>בית</span>
              <span style={{ textAlign: 'center' }}>נפשות</span>
            </div>
            {snapshot.checkins.map((c, i) => (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: '1.5fr 1fr 60px 60px',
                padding: '10px 14px', borderBottom: '1px solid var(--color-border)',
                fontSize: '12px',
              }}>
                <span style={{ fontWeight: 600 }}>
                  {c.userName}
                  {c.isGuest && (
                    <span style={{
                      marginRight: '4px', fontSize: '9px', padding: '0 4px',
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
              display: 'grid', gridTemplateColumns: '1.5fr 1fr 60px 60px',
              padding: '10px 14px', fontSize: '12px', fontWeight: 800, color: 'var(--color-accent)',
            }}>
              <span>סה"כ</span>
              <span />
              <span />
              <span style={{ textAlign: 'center' }}>{totalPeople}</span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
