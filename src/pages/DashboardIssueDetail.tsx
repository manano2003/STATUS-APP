import { useParams } from 'react-router-dom'
import { getShelterById } from '../data/shelters'
import { useStore } from '../data/store'
import PageLayout from '../components/PageLayout'

export default function DashboardIssueDetail() {
  const { id } = useParams<{ id: string }>()
  const { getShelterIssues, removeIssue } = useStore()

  const shelter = id ? getShelterById(id) : undefined
  const report = id ? getShelterIssues(id) : undefined

  if (!shelter) return <div style={{ paddingTop: '100px', textAlign: 'center' }}>מקלט לא נמצא</div>

  return (
    <PageLayout title={`${shelter.name} — מקלט ${shelter.number}`} subtitle="תקלות במקלט" backTo="/dashboard/issues">
      <p style={{
        fontSize: '16px', fontWeight: 800, marginBottom: '16px', textAlign: 'center',
        color: report && report.issues.length > 0 ? 'var(--color-danger)' : 'var(--color-success)',
      }}>
        {report?.issues.length ?? 0} תקלות
      </p>

      <div style={{
        background: 'var(--color-bg-card)',
        borderRadius: 'var(--radius)',
        border: '1px solid var(--color-border)',
        overflow: 'hidden',
      }}>
        {!report || report.issues.length === 0 ? (
          <p style={{ padding: '32px', textAlign: 'center', color: 'var(--color-success)', fontSize: '14px', fontWeight: 700 }}>
            אין תקלות במקלט זה ✓
          </p>
        ) : (
          <>
            {report.issues.map((issue, i) => (
              <div
                key={issue}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '12px 14px',
                  borderBottom: i < report.issues.length - 1 ? '1px solid var(--color-border)' : 'none',
                }}
              >
                <div
                  onClick={() => removeIssue(report.id, issue)}
                  style={{
                    width: '22px', height: '22px', borderRadius: '50%',
                    border: '2px solid var(--color-danger)',
                    background: 'var(--color-danger)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, cursor: 'pointer', transition: 'all 0.2s',
                  }}
                >
                  <span style={{ color: 'white', fontSize: '12px', fontWeight: 800 }}>✓</span>
                </div>
                <span style={{ fontSize: '14px', color: 'var(--color-text)' }}>{issue}</span>
              </div>
            ))}
            <div style={{
              padding: '10px 14px', borderTop: '1px solid var(--color-border)',
              fontSize: '11px', color: 'var(--color-text-secondary)',
            }}>
              דווח ע"י: {report.reportedBy} | {new Date(report.timestamp).toLocaleString('he-IL', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
            </div>
          </>
        )}
      </div>
    </PageLayout>
  )
}
