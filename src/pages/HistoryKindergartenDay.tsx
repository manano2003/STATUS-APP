import { useParams } from 'react-router-dom'
import { getKindergartenById } from '../data/kindergartens'
import { useStore } from '../data/store'
import BackButton from '../components/BackButton'

export default function HistoryKindergartenDay() {
  const { id, date } = useParams<{ id: string; date: string }>()
  const { kindergartenHistory } = useStore()

  const kg = id ? getKindergartenById(id) : undefined
  const snapshot = kindergartenHistory.find(s => s.kindergartenId === id && s.date === date)

  if (!kg) return <div style={{ paddingTop: '100px', textAlign: 'center' }}>גן לא נמצא</div>

  const formatDate = (d: string) => {
    const parts = d.split('-')
    return `${parts[2]}/${parts[1]}/${parts[0]}`
  }

  return (
    <div style={{ paddingTop: '68px', padding: '68px 16px 100px', maxWidth: '500px', margin: '0 auto' }}>
      <BackButton to={`/dashboard/history/kindergartens/${kg.id}`} />

      <h1 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '4px', textAlign: 'center' }}>
        {kg.name}
      </h1>
      <p style={{ color: 'var(--color-accent)', fontSize: '16px', fontWeight: 700, marginBottom: '4px', textAlign: 'center' }}>
        {date ? formatDate(date) : ''}
      </p>
      <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px', marginBottom: '16px', textAlign: 'center' }}>
        {snapshot ? `${snapshot.presentChildren.length} נוכחים` : 'אין נתונים ליום זה'}
      </p>

      {snapshot ? (
        <div style={{
          background: 'var(--color-bg-card)', borderRadius: 'var(--radius)',
          border: '1px solid var(--color-border)', overflow: 'hidden',
        }}>
          {/* Children - present first, then absent */}
          {[...kg.children]
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
          {kg.staff.length > 0 && (
            <>
              <div style={{
                padding: '8px 14px', background: 'rgba(77, 166, 232, 0.08)',
                borderBottom: '1px solid var(--color-border)',
                fontSize: '14px', fontWeight: 800, color: 'var(--color-accent)', textAlign: 'center',
              }}>
                סגל חינוכי
              </div>
              {kg.staff.map(member => {
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
    </div>
  )
}
