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

      {/* WhatsApp + Print */}
      {report && report.issues.length > 0 && (
        <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
          <button onClick={() => {
            let text = `*${shelter.name} — מקלט ${shelter.number}*\n${report.issues.length} תקלות\n\n`
            report.issues.forEach((issue, i) => { text += `${i + 1}. ${issue}\n` })
            text += `\nדווח ע"י: ${report.reportedBy}`
            window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
          }} style={{
            flex: 1, padding: '14px', borderRadius: 'var(--radius)',
            border: '1px solid var(--color-success)', background: 'rgba(77, 232, 138, 0.08)',
            color: 'var(--color-success)', fontSize: '14px', fontWeight: 700, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontFamily: 'var(--font-family)',
          }}>
            <span style={{ fontSize: '18px' }}>💬</span> WhatsApp
          </button>
          <button onClick={() => {
            let text = `${shelter.name} — מקלט ${shelter.number}\n${report.issues.length} תקלות\n\n`
            report.issues.forEach((issue, i) => { text += `${i + 1}. ${issue}\n` })
            text += `\nדווח ע"י: ${report.reportedBy}`
            const w = window.open('', '_blank')
            if (w) {
              w.document.write(`<html dir="rtl"><head><title>תקלות — ${shelter.name}</title><style>body{font-family:Arial;padding:40px;direction:rtl}h1{color:#0A1628;border-bottom:2px solid #4DA6E8;padding-bottom:10px}pre{white-space:pre-wrap;font-family:Arial;font-size:14px;line-height:1.8}</style></head><body><h1>תקלות — ${shelter.name} מקלט ${shelter.number}</h1><pre>${text}</pre><script>window.print()<\/script></body></html>`)
              w.document.close()
            }
          }} style={{
            flex: 1, padding: '14px', borderRadius: 'var(--radius)',
            border: '1px solid var(--color-border)', background: 'var(--color-bg-card)',
            color: 'var(--color-accent)', fontSize: '14px', fontWeight: 700, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontFamily: 'var(--font-family)',
          }}>
            <span style={{ fontSize: '18px' }}>🖨️</span> הדפסה
          </button>
        </div>
      )}
    </PageLayout>
  )
}
