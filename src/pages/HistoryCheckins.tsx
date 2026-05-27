import { useStore } from '../data/store'
import { getShelterById } from '../data/shelters'
import PageLayout from '../components/PageLayout'

export default function HistoryCheckins() {
  const { checkinHistory } = useStore()

  const formatDate = (ts: number) =>
    new Date(ts).toLocaleString('he-IL', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })

  const sorted = [...checkinHistory].sort((a, b) => b.checkinTime - a.checkinTime)

  return (
    <PageLayout title="🏛️ היסטוריית נוכחות במקלטים" subtitle={`סה"כ ${checkinHistory.length} רישומים`} backTo="/dashboard/history">

      <div style={{
        background: 'var(--color-bg-card)', borderRadius: 'var(--radius)',
        border: '1px solid var(--color-border)', overflow: 'hidden',
      }}>
        {sorted.length === 0 ? (
          <p style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '13px' }}>
            אין היסטוריה עדיין
          </p>
        ) : (
          <>
            <div style={{
              display: 'grid', gridTemplateColumns: '1.2fr 1fr 50px 80px',
              padding: '8px 12px', borderBottom: '1px solid var(--color-border)',
              fontSize: '10px', fontWeight: 700, color: 'var(--color-text-secondary)',
            }}>
              <span>שם</span>
              <span>מקלט</span>
              <span style={{ textAlign: 'center' }}>נפשות</span>
              <span style={{ textAlign: 'center' }}>תאריך</span>
            </div>
            {sorted.map(entry => {
              const shelter = getShelterById(entry.shelterId)
              return (
                <div key={entry.id} style={{
                  display: 'grid', gridTemplateColumns: '1.2fr 1fr 50px 80px',
                  padding: '10px 12px', borderBottom: '1px solid var(--color-border)',
                  fontSize: '12px',
                }}>
                  <span style={{ fontWeight: 600 }}>
                    {entry.userName}
                    {entry.isGuest && (
                      <span style={{
                        marginRight: '4px', fontSize: '9px', padding: '0 4px',
                        borderRadius: '6px', background: 'rgba(232, 197, 77, 0.15)',
                        color: 'var(--color-warning)',
                      }}>אורח</span>
                    )}
                  </span>
                  <span style={{ color: 'var(--color-accent)', fontSize: '11px' }}>
                    {shelter?.name ?? '—'}
                  </span>
                  <span style={{ textAlign: 'center', fontWeight: 700 }}>{entry.peopleCount}</span>
                  <span style={{ textAlign: 'center', fontSize: '10px', color: 'var(--color-text-secondary)' }}>
                    {formatDate(entry.checkinTime)}
                  </span>
                </div>
              )
            })}
          </>
        )}
      </div>
    </PageLayout>
  )
}
