import { useNavigate } from 'react-router-dom'
import { regularShelters } from '../data/shelters'
import { useStore } from '../data/store'
import BackButton from '../components/BackButton'

export default function DashboardIssues() {
  const navigate = useNavigate()
  const { issueReports, getShelterIssues, clearAllIssueReports } = useStore()

  const totalIssues = issueReports.reduce((sum, r) => sum + r.issues.length, 0)

  return (
    <div style={{ paddingTop: '68px', padding: '68px 16px 100px', maxWidth: '600px', margin: '0 auto' }}>
      <BackButton to="/dashboard/reports" />

      <h1 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' , justifyContent: 'center'}}>
        <span>🔧</span> תקלות במקלטים
      </h1>
      <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px', marginBottom: '16px' , textAlign: 'center'}}>
        סה"כ <span style={{ color: 'var(--color-danger)', fontWeight: 800 }}>{totalIssues}</span> תקלות בכלל המקלטים
      </p>

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
    </div>
  )
}
