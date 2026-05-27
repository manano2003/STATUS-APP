import { useNavigate } from 'react-router-dom'
import { getRegularShelters } from '../data/shelters'
import { useStore } from '../data/store'
import PageLayout from '../components/PageLayout'

export default function DashboardIssues() {
  const navigate = useNavigate()
  const { issueReports, getShelterIssues, clearAllIssueReports } = useStore()
  const regularShelters = getRegularShelters()

  const totalIssues = issueReports.reduce((sum, r) => sum + r.issues.length, 0)

  return (
    <PageLayout title="🔧 תקלות במקלטים" subtitle={`סה"כ ${totalIssues} תקלות בכלל המקלטים`} backTo="/dashboard/reports">

      <div style={{
        background: 'var(--color-bg-card)',
        borderRadius: 'var(--radius)',
        border: '1px solid var(--color-border)',
        overflow: 'hidden',
      }}>
        {regularShelters.map(shelter => {
          const report = getShelterIssues(shelter.id)
          const issueCount = report?.issues.length ?? 0
          const hasIssues = issueCount > 0

          return (
            <div
              key={shelter.id}
              onClick={() => hasIssues ? navigate(`/dashboard/issues/${shelter.id}`) : null}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '11px 14px',
                borderBottom: '1px solid var(--color-border)',
                cursor: hasIssues ? 'pointer' : 'default',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => { if (hasIssues) e.currentTarget.style.background = 'rgba(77, 166, 232, 0.05)' }}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', minWidth: '20px' }}>
                {shelter.number}
              </span>
              <span style={{ fontSize: '13px', fontWeight: 600, flex: 1 }}>{shelter.name}</span>
              <span style={{
                width: '10px', height: '10px', borderRadius: '50%',
                background: hasIssues ? 'var(--color-danger)' : 'var(--color-success)',
                marginLeft: '8px',
              }} />
              <span style={{
                fontSize: '13px', fontWeight: 800, minWidth: '24px', textAlign: 'left',
                color: hasIssues ? 'var(--color-danger)' : 'var(--color-success)',
                marginLeft: '4px',
              }}>
                {issueCount}
              </span>
            </div>
          )
        })}
      </div>

      {totalIssues > 0 && (
        <button
          onClick={() => { if (confirm('האם למחוק את כל התקלות בכלל המקלטים?')) clearAllIssueReports() }}
          style={{
            display: 'block',
            width: '100%',
            marginTop: '16px',
            padding: '14px',
            borderRadius: 'var(--radius)',
            border: '1px solid rgba(232, 77, 77, 0.3)',
            background: 'rgba(232, 77, 77, 0.08)',
            color: 'var(--color-danger)',
            fontSize: '14px',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          מחק כלל התקלות
        </button>
      )}

      {/* WhatsApp + Print */}
      {totalIssues > 0 && (
        <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
          <button onClick={() => {
            let text = `*תקלות במקלטים*\nסה"כ: ${totalIssues} תקלות\n\n`
            regularShelters.forEach(s => {
              const report = getShelterIssues(s.id)
              if (!report || report.issues.length === 0) return
              text += `*${s.number}. ${s.name} (${report.issues.length}):*\n`
              report.issues.forEach((issue, i) => { text += `  ${i + 1}. ${issue}\n` })
              text += '\n'
            })
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
            let text = `תקלות במקלטים\nסה"כ: ${totalIssues} תקלות\n\n`
            regularShelters.forEach(s => {
              const report = getShelterIssues(s.id)
              if (!report || report.issues.length === 0) return
              text += `${s.number}. ${s.name} (${report.issues.length}):\n`
              report.issues.forEach((issue, i) => { text += `  ${i + 1}. ${issue}\n` })
              text += '\n'
            })
            const w = window.open('', '_blank')
            if (w) {
              w.document.write(`<html dir="rtl"><head><title>תקלות במקלטים</title><style>body{font-family:Arial;padding:40px;direction:rtl}h1{color:#0A1628;border-bottom:2px solid #4DA6E8;padding-bottom:10px}pre{white-space:pre-wrap;font-family:Arial;font-size:14px;line-height:1.8}</style></head><body><h1>תקלות במקלטים</h1><pre>${text}</pre><script>window.print()<\/script></body></html>`)
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
