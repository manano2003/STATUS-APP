import { useNavigate } from 'react-router-dom'
import { useStore } from '../data/store'
import BackButton from '../components/BackButton'

export default function DashboardHistory() {
  const navigate = useNavigate()
  const { shelterHistory, issueHistory, distressHistory, kindergartenHistory, clubHistory } = useStore()

  const cards = [
    {
      icon: '🏛️',
      label: 'נוכחות במקלטים',
      description: 'היסטוריית נוכחות לפי מקלט ותאריך',
      path: '/dashboard/history/shelters',
      count: shelterHistory.length,
      color: 'var(--color-accent)',
    },
    {
      icon: '👶',
      label: 'נוכחות בגנים',
      description: 'היסטוריית נוכחות יומית בגנים',
      path: '/dashboard/history/kindergartens',
      count: kindergartenHistory.length,
      color: 'var(--color-success)',
    },
    {
      icon: '⚽',
      label: 'נוכחות במועדונים',
      description: 'היסטוריית נוכחות יומית במועדונים',
      path: '/dashboard/history/clubs',
      count: clubHistory.length,
      color: 'var(--color-warning)',
    },
    {
      icon: '🔧',
      label: 'תקלות שתוקנו',
      description: 'היסטוריית תקלות במקלטים',
      path: '/dashboard/history/issues',
      count: issueHistory.length,
      color: 'var(--color-accent)',
    },
    {
      icon: '🆘',
      label: 'קריאות מצוקה',
      description: 'היסטוריית קריאות שטופלו',
      path: '/dashboard/history/distress',
      count: distressHistory.length,
      color: 'var(--color-danger)',
    },
  ]

  return (
    <div style={{ paddingTop: '68px', padding: '68px 16px 100px', maxWidth: '600px', margin: '0 auto' }}>
      <BackButton to="/dashboard" />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: '36px', height: '36px', borderRadius: '8px',
          background: 'rgba(232, 197, 77, 0.15)', fontSize: '18px',
        }}>📜</span>
        <h1 style={{ fontSize: '22px', fontWeight: 800, margin: 0, textAlign: 'center' }}>היסטוריה</h1>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {cards.map(card => (
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
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-warning)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(77, 166, 232, 0.2)'}
          >
            <span style={{ fontSize: '28px' }}>{card.icon}</span>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 2px' }}>{card.label}</p>
              <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: 0 , textAlign: 'center'}}>{card.description}</p>
            </div>
            <span style={{ fontSize: '20px', fontWeight: 800, color: card.color }}>{card.count}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
