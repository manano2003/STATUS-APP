import { useParams, useNavigate } from 'react-router-dom'
import { getShelterById } from '../data/shelters'
import { useStore } from '../data/store'
import { writeOrQueue } from '../data/outbox'
import PageLayout from '../components/PageLayout'

export default function HistoryShelterDay() {
  const { id, date } = useParams<{ id: string; date: string }>()
  const navigate = useNavigate()
  const { shelterHistory, removeShelterHistory, currentUser } = useStore()

  const shelter = id ? getShelterById(id) : undefined
  const snapshot = shelterHistory.find(s => s.shelterId === id && s.date === date)

  if (!shelter) return <div style={{ paddingTop: '100px', textAlign: 'center' }}>מקלט לא נמצא</div>

  const formatDate = (d: string) => {
    const parts = d.split('-')
    return `${parts[2]}/${parts[1]}/${parts[0]}`
  }

  const totalPeople = snapshot?.checkins.reduce((sum, c) => sum + c.peopleCount, 0) ?? 0

  const isAdmin = currentUser?.roles.includes('ADMIN') || currentUser?.roles.includes('חמ"ל')

  const handleDelete = async () => {
    if (!snapshot || !currentUser) return
    if (!confirm('האם למחוק רישום זה מההיסטוריה?')) return
    const data = await writeOrQueue('secure_delete_shelter_history', {
      caller_id: currentUser.id,
      history_id: snapshot.id,
    })
    if (data?.success) {
      removeShelterHistory(snapshot.id)
      navigate(`/dashboard/history/shelters/${id}`)
    }
  }

  return (
    <PageLayout title={shelter.name} subtitle={date ? formatDate(date) : ''} backTo={`/dashboard/history/shelters/${shelter.id}`}>
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

      {isAdmin && snapshot && (
        <button
          onClick={handleDelete}
          style={{
            display: 'block', width: '100%', marginTop: '16px', padding: '14px',
            borderRadius: 'var(--radius)',
            border: '1px solid rgba(232, 77, 77, 0.3)',
            background: 'rgba(232, 77, 77, 0.08)',
            color: 'var(--color-danger)', fontSize: '14px', fontWeight: 700, cursor: 'pointer',
          }}
        >
          מחק רישום
        </button>
      )}
    </PageLayout>
  )
}
