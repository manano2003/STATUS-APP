import { useStore } from '../data/store'
import BackButton from '../components/BackButton'

export default function HistoryIssues() {
  const { issueHistory } = useStore()

  const grouped = issueHistory.reduce<Record<string, typeof issueHistory>>((acc, entry) => {
    if (!acc[entry.shelterName]) acc[entry.shelterName] = []
    acc[entry.shelterName].push(entry)
    return acc
  }, {})

  const formatDate = (ts: number) =>
    new Date(ts).toLocaleString('he-IL', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })

  return (
    <div style={{ paddingTop: '68px', padding: '68px 16px 100px', maxWidth: '600px', margin: '0 auto' }}>
      <BackButton to="/dashboard/history" />

      <h1 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' , justifyContent: 'center'}}>
        <span>🔧</span> תקלות שתוקנו
      </h1>
      <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px', marginBottom: '16px' , textAlign: 'center'}}>
        סה"כ <span style={{ color: 'var(--color-accent)', fontWeight: 800 }}>{issueHistory.length}</span> תקלות תוקנו
      </p>

      {issueHistory.length === 0 ? (
        <div style={{
          background: 'var(--color-bg-card)', borderRadius: 'var(--radius)',
          border: '1px solid var(--color-border)', padding: '32px', textAlign: 'center',
          color: 'var(--color-text-secondary)', fontSize: '13px',
        }}>
          אין היסטוריה עדיין
        </div>
      ) : (
        Object.entries(grouped).map(([shelterName, entries]) => (
          <div key={shelterName} style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-accent)', marginBottom: '8px' }}>
              {shelterName}
            </h3>
            <div style={{
              background: 'var(--color-bg-card)', borderRadius: 'var(--radius)',
              border: '1px solid var(--color-border)', overflow: 'hidden',
            }}>
              <div style={{
                display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr',
                padding: '8px 12px', borderBottom: '1px solid var(--color-border)',
                fontSize: '10px', fontWeight: 700, color: 'var(--color-text-secondary)',
              }}>
                <span>תקלה</span>
                <span>דווח ע"י</span>
                <span>תוקן ע"י</span>
              </div>
              {entries.map(entry => (
                <div key={entry.id} style={{
                  display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr',
                  padding: '10px 12px', borderBottom: '1px solid var(--color-border)',
                  fontSize: '12px',
                }}>
                  <span style={{ fontWeight: 600 }}>{entry.issue}</span>
                  <div>
                    <p style={{ margin: 0, fontSize: '11px' }}>{entry.reportedBy}</p>
                    <p style={{ margin: 0, fontSize: '9px', color: 'var(--color-text-secondary)' , textAlign: 'center'}}>
                      {formatDate(entry.reportedAt)}
                    </p>
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: '11px', color: 'var(--color-success)' }}>{entry.resolvedBy}</p>
                    <p style={{ margin: 0, fontSize: '9px', color: 'var(--color-text-secondary)' , textAlign: 'center'}}>
                      {formatDate(entry.resolvedAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
