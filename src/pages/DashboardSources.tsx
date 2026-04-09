import { useNavigate } from 'react-router-dom'
import { useStore } from '../data/store'
import { kindergartens } from '../data/kindergartens'
import { clubs } from '../data/clubs'
import BackButton from '../components/BackButton'

interface SourceCard {
  icon: string
  label: string
  description: string
  path: string
  count?: number
}

export default function DashboardSources() {
  const navigate = useNavigate()
  const { users } = useStore()

  const sources: SourceCard[] = [
    { icon: '👥', label: 'רשומים במערכת', description: 'כל המשתמשים הרשומים ופרטיהם', path: '/dashboard/users', count: users.length },
    { icon: '👶', label: 'ילדים בגנים', description: 'רשימות ילדים לפי גן', path: '/kindergartens', count: kindergartens.reduce((s, k) => s + k.children.length, 0) },
    { icon: '⚽', label: 'מועדונים', description: 'חברי מועדונים וקבוצות ספורט', path: '/clubs', count: clubs.reduce((s, c) => s + c.children.length, 0) },
  ]

  return (
    <div style={{ paddingTop: '68px', padding: '68px 16px 100px', maxWidth: '600px', margin: '0 auto' }}>
      <BackButton to="/dashboard" />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: '36px', height: '36px', borderRadius: '8px',
          background: 'rgba(77, 166, 232, 0.15)', fontSize: '18px',
        }}>📋</span>
        <h1 style={{ fontSize: '22px', fontWeight: 800, margin: 0, textAlign: 'center' }}>טבלאות מקור</h1>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {sources.map(card => (
          <button
            key={card.path}
            onClick={() => navigate(card.path)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              padding: '16px',
              background: 'var(--color-bg-card)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius)',
              cursor: 'pointer',
              textAlign: 'right',
              color: 'var(--color-text)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--color-accent)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(77, 166, 232, 0.2)'
            }}
          >
            <span style={{ fontSize: '28px' }}>{card.icon}</span>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 2px' }}>{card.label}</p>
              <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: 0 , textAlign: 'center'}}>{card.description}</p>
            </div>
            {card.count !== undefined && (
              <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-accent)' }}>
                {card.count}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
