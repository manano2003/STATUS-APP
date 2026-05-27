import { useParams, useNavigate } from 'react-router-dom'
import SchoolHome from './SchoolHome'

export default function SchoolManagement() {
  const { schoolId } = useParams<{ schoolId: string }>()
  const navigate = useNavigate()

  const reports = [
    { icon: '📚', label: 'נוכחות בכיתות', desc: 'מצב נוכחות בזמן אמת', path: `/schools/${schoolId}/classes`, count: 0, countLabel: 'תלמידים' },
  ]

  return (
    <SchoolHome content={
      <>
        {/* Reports */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {reports.map(card => (
            <button
              key={card.path}
              onClick={() => navigate(card.path)}
              style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                padding: '16px', background: 'var(--color-bg-card)',
                border: '1px solid var(--color-border)', borderRadius: 'var(--radius)',
                cursor: 'pointer', textAlign: 'right', color: 'var(--color-text)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-accent)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(77, 166, 232, 0.2)'}
            >
              <span style={{ fontSize: '28px', width: '40px', textAlign: 'center', flexShrink: 0 }}>{card.icon}</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 2px', textAlign: 'right' }}>{card.label}</p>
                <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', margin: 0, textAlign: 'right' }}>{card.desc}</p>
              </div>
              <div style={{ width: '50px', textAlign: 'center', flexShrink: 0 }}>
                <span style={{
                  fontSize: '20px', fontWeight: 800,
                  color: card.count > 0 ? 'var(--color-danger)' : 'var(--color-success)',
                }}>{card.count}</span>
                <p style={{ fontSize: '9px', color: 'var(--color-text-secondary)', margin: '2px 0 0', textAlign: 'center' }}>{card.countLabel}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Quick access buttons */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '40px', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate(`/schools/${schoolId}/sources`)}
            style={{
              flex: 1, minWidth: '80px', padding: '14px', background: 'var(--color-bg-card)',
              border: '1px solid var(--color-border)', borderRadius: 'var(--radius)',
              cursor: 'pointer', textAlign: 'center',
            }}
          >
            <span style={{ fontSize: '20px' }}>📋</span>
            <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-accent)', margin: '4px 0 0' }}>טבלאות מקור</p>
          </button>
          <button
            onClick={() => alert('אזור בבניה')}
            style={{
              flex: 1, minWidth: '80px', padding: '14px', background: 'var(--color-bg-card)',
              border: '1px solid var(--color-border)', borderRadius: 'var(--radius)',
              cursor: 'pointer', textAlign: 'center',
            }}
          >
            <span style={{ fontSize: '20px' }}>📜</span>
            <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-warning)', margin: '4px 0 0' }}>היסטוריה</p>
          </button>
          <button
            onClick={() => alert('אזור בבניה')}
            style={{
              flex: 1, minWidth: '80px', padding: '14px', background: 'var(--color-bg-card)',
              border: '1px solid var(--color-border)', borderRadius: 'var(--radius)',
              cursor: 'pointer', textAlign: 'center',
            }}
          >
            <span style={{ fontSize: '20px' }}>🗄️</span>
            <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-secondary)', margin: '4px 0 0' }}>גיבוי</p>
          </button>
        </div>
      </>
    } />
  )
}
