import { useNavigate } from 'react-router-dom'
import { useStore } from '../data/store'
import { regularShelters, specialStatuses } from '../data/shelters'

import BackButton from '../components/BackButton'

interface ReportCard {
  icon: string
  label: string
  description: string
  path: string
  count?: number
  countLabel?: string
}

export default function DashboardReports() {
  const navigate = useNavigate()
  const { checkins, getShelterPeopleCount, distressAlerts, issueReports } = useStore()

  const totalPeople = [...regularShelters, ...specialStatuses].reduce((sum, s) => sum + getShelterPeopleCount(s.id), 0)

  const reports: ReportCard[] = [
    { icon: '🏛️', label: 'נוכחות במקלטים', description: 'מצב מקלטים בזמן אמת', path: '/dashboard/shelters', count: totalPeople, countLabel: 'נפשות' },
    { icon: '🆘', label: 'קריאות מצוקה', description: 'קריאות מצוקה פעילות', path: '/dashboard/distress', count: distressAlerts.length, countLabel: 'קריאות' },
    { icon: '🔧', label: 'תקלות במקלטים', description: 'דיווחי תקלות ותחזוקה', path: '/dashboard/issues', count: issueReports.reduce((s, r) => s + r.issues.length, 0), countLabel: 'תקלות' },
  ]

  return (
    <div style={{ paddingTop: '68px', padding: '68px 16px 100px', maxWidth: '600px', margin: '0 auto' }}>
      <BackButton to="/dashboard" />

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: '36px', height: '36px', borderRadius: '8px',
          background: 'rgba(77, 232, 138, 0.15)', fontSize: '18px',
        }}>📊</span>
        <h1 style={{ fontSize: '22px', fontWeight: 800, margin: 0 , textAlign: 'center'}}>דוחות</h1>
      </div>
      <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px', marginBottom: '20px' , textAlign: 'center'}}>
        {checkins.length} דיווחים | {totalPeople} נפשות במקלטים
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {reports.map(card => (
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
              e.currentTarget.style.borderColor = 'var(--color-success)'
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
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '20px', fontWeight: 800, color: card.count > 0 ? 'var(--color-danger)' : 'var(--color-success)' }}>
                  {card.count}
                </span>
                {card.countLabel && (
                  <p style={{ fontSize: '10px', color: 'var(--color-text-secondary)', margin: '2px 0 0' , textAlign: 'center'}}>
                    {card.countLabel}
                  </p>
                )}
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
