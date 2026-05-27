import { useParams, useNavigate } from 'react-router-dom'
import SchoolHome from './SchoolHome'

export default function SchoolSources() {
  const { schoolId } = useParams<{ schoolId: string }>()
  const navigate = useNavigate()

  const sources = [
    { icon: '👥', label: 'משתמשים במערכת', description: 'מורות וצוות בית הספר', path: `/schools/${schoolId}/sources/users` },
    { icon: '👦', label: 'רשימת תלמידים וכיתות', description: 'תלמידים ומורות לפי כיתות', path: `/schools/${schoolId}/sources/students` },
  ]

  return (
    <SchoolHome backTo={`/schools/${schoolId}/management`} content={
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {sources.map(card => (
          <button
            key={card.label}
            onClick={() => card.path ? navigate(card.path) : alert('אזור בבניה')}
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
              <p style={{ fontSize: '12px', color: card.path ? 'var(--color-text-secondary)' : 'var(--color-danger)', margin: 0, textAlign: 'right' }}>{card.description}</p>
            </div>
          </button>
        ))}
      </div>
    } />
  )
}
