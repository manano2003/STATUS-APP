import { useNavigate } from 'react-router-dom'
import { useStore } from '../data/store'
import PageLayout from '../components/PageLayout'

export default function DashboardHistory() {
  const navigate = useNavigate()
  const { shelterHistory, issueHistory, distressHistory, kindergartenHistory, clubHistory, emergencyHistory } = useStore()

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
    {
      icon: '🚨',
      label: 'עדכון סטאטוס תושבים בחירום',
      description: 'היסטוריית עדכוני סטאטוס חירום',
      path: '/dashboard/history/emergency',
      count: emergencyHistory.length,
      color: 'var(--color-danger)',
    },
  ]

  return (
    <PageLayout title="📜 היסטוריה" backTo="/dashboard">

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
            <span style={{ fontSize: '28px', width: '40px', textAlign: 'center', flexShrink: 0 }}>{card.icon}</span>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 2px', textAlign: 'right' }}>{card.label}</p>
              <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: 0, textAlign: 'right' }}>{card.description}</p>
            </div>
            <span style={{ fontSize: '20px', fontWeight: 800, color: card.color, width: '40px', textAlign: 'center', flexShrink: 0 }}>{card.count}</span>
          </button>
        ))}
      </div>
    </PageLayout>
  )
}
