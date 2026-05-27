import { useParams } from 'react-router-dom'
import { getShelterById } from '../data/shelters'
import { useStore } from '../data/store'
import PageLayout from '../components/PageLayout'

export default function HistoryIssueDay() {
  const { id, date } = useParams<{ id: string; date: string }>()
  const { issueHistory } = useStore()

  const shelter = id ? getShelterById(id) : undefined
  if (!shelter) return <div style={{ paddingTop: '100px', textAlign: 'center' }}>מקלט לא נמצא</div>

  const entries = issueHistory.filter(e => {
    if (e.shelterId !== shelter.id) return false
    const d = new Date(e.resolvedAt).toISOString().split('T')[0]
    return d === date
  })

  const formatDate = (d: string) => { const p = d.split('-'); return `${p[2]}/${p[1]}/${p[0]}` }

  return (
    <PageLayout title={shelter.name} subtitle={date ? formatDate(date) : ''} backTo={`/dashboard/history/issues/${shelter.id}`}>
      <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px', marginBottom: '16px', textAlign: 'center' }}>
        {entries.length} תקלות תוקנו
      </p>

      <div style={{
        background: 'var(--color-bg-card)', borderRadius: 'var(--radius)',
        border: '1px solid var(--color-border)', overflow: 'hidden',
      }}>
        {entries.length === 0 ? (
          <p style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '13px' }}>
            לא תוקנו תקלות ביום זה
          </p>
        ) : (
          <>
            <div style={{
              display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr',
              padding: '10px 14px', borderBottom: '1px solid var(--color-border)',
              fontSize: '11px', fontWeight: 700, color: 'var(--color-text-secondary)',
            }}>
              <span>תקלה</span><span>דווח ע"י</span><span>תוקן ע"י</span>
            </div>
            {entries.map(e => (
              <div key={e.id} style={{
                display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr',
                padding: '10px 14px', borderBottom: '1px solid var(--color-border)', fontSize: '12px',
              }}>
                <span style={{ fontWeight: 600 }}>{e.issue}</span>
                <span style={{ fontSize: '11px' }}>{e.reportedBy}</span>
                <span style={{ fontSize: '11px', color: 'var(--color-success)' }}>{e.resolvedBy}</span>
              </div>
            ))}
          </>
        )}
      </div>
    </PageLayout>
  )
}
