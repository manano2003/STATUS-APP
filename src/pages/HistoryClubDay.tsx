import { useParams } from 'react-router-dom'
import { getClubById } from '../data/sourceData'
import { useStore } from '../data/store'
import PageLayout from '../components/PageLayout'

export default function HistoryClubDay() {
  const { id, date } = useParams<{ id: string; date: string }>()
  const { clubHistory } = useStore()

  const club = id ? getClubById(id) : undefined
  const snapshot = clubHistory.find(s => s.kindergartenId === id && s.date === date)

  if (!club) return <div style={{ paddingTop: '100px', textAlign: 'center' }}>מועדון לא נמצא</div>

  const formatDate = (d: string) => {
    const parts = d.split('-')
    return `${parts[2]}/${parts[1]}/${parts[0]}`
  }

  return (
    <PageLayout title={club.name} subtitle={date ? formatDate(date) : ''} backTo={`/dashboard/history/clubs/${club.id}`}>
      <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px', marginBottom: '16px', textAlign: 'center' }}>
        {snapshot ? `${snapshot.presentChildren.length} נוכחים` : 'אין נתונים ליום זה'}
      </p>

      {snapshot ? (
        <div style={{
          background: 'var(--color-bg-card)', borderRadius: 'var(--radius)',
          border: '1px solid var(--color-border)', overflow: 'hidden',
        }}>
          {/* Children - present first, then absent */}
          {[...club.children]
            .sort((a, b) => {
              const aP = snapshot.presentChildren.includes(a) ? 0 : 1
              const bP = snapshot.presentChildren.includes(b) ? 0 : 1
              return aP - bP
            })
            .map(child => {
              const isPresent = snapshot.presentChildren.includes(child)
              return (
                <div key={child} style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '10px 14px', borderBottom: '1px solid var(--color-border)',
                  fontSize: '13px',
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
          {club.staff.length > 0 && (
            <>
              <div style={{
                padding: '8px 14px', background: 'rgba(77, 166, 232, 0.08)',
                borderBottom: '1px solid var(--color-border)',
                fontSize: '14px', fontWeight: 800, color: 'var(--color-accent)', textAlign: 'center',
              }}>
                סגל חינוכי
              </div>
              {club.staff.map(member => {
                const isPresent = snapshot.presentChildren.includes(member)
                return (
                  <div key={member} style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '10px 14px', borderBottom: '1px solid var(--color-border)',
                    fontSize: '13px',
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

          <div style={{
            padding: '10px 14px', fontSize: '10px', color: 'var(--color-text-secondary)',
            textAlign: 'center',
          }}>
            דווח ע"י: {snapshot.reportedBy} | {new Date(snapshot.timestamp).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      ) : (
        <div style={{
          background: 'var(--color-bg-card)', borderRadius: 'var(--radius)',
          border: '1px solid var(--color-border)', padding: '32px', textAlign: 'center',
          color: 'var(--color-text-secondary)', fontSize: '13px',
        }}>
          לא דווחה נוכחות ביום זה
        </div>
      )}
    </PageLayout>
  )
}
