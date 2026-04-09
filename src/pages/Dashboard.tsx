import { useNavigate } from 'react-router-dom'
import { useStore } from '../data/store'
import { regularShelters, specialStatuses } from '../data/shelters'
import { kindergartens } from '../data/kindergartens'
import { clubs } from '../data/clubs'
import BackButton from '../components/BackButton'

export default function Dashboard() {
  const navigate = useNavigate()
  const { checkins, getShelterPeopleCount, distressAlerts, issueReports, getKindergartenAttendance, getClubAttendance, emergencyStatuses } = useStore()

  const totalPeople = [...regularShelters, ...specialStatuses].reduce((sum, s) => sum + getShelterPeopleCount(s.id), 0)
  const totalKidsPresent = kindergartens.reduce((sum, k) => sum + (getKindergartenAttendance(k.id)?.presentChildren.length ?? 0), 0)
  const totalClubPresent = clubs.reduce((sum, c) => sum + (getClubAttendance(c.id)?.presentChildren.length ?? 0), 0)

  const reports = [
    { icon: '🏛️', label: 'נוכחות במקלטים', desc: 'מצב מקלטים בזמן אמת', path: '/dashboard/shelters', count: totalPeople, countLabel: 'נפשות' },
    { icon: '👶', label: 'נוכחות בגנים', desc: 'נוכחות ילדים בגנים', path: '/dashboard/kindergartens', count: totalKidsPresent, countLabel: 'ילדים' },
    { icon: '⚽', label: 'נוכחות במועדונים', desc: 'נוכחות במועדונים', path: '/dashboard/clubs', count: totalClubPresent, countLabel: 'חניכים' },
    { icon: '🚨', label: 'סטטוס תושבים בחירום', desc: 'מצב תושבים באירוע חירום', path: '/dashboard/emergency', count: emergencyStatuses.length, countLabel: 'עודכנו' },
    { icon: '🆘', label: 'קריאות מצוקה', desc: 'קריאות מצוקה פעילות', path: '/dashboard/distress', count: distressAlerts.length, countLabel: 'קריאות' },
    { icon: '🔧', label: 'תקלות במקלטים', desc: 'דיווחי תקלות ותחזוקה', path: '/dashboard/issues', count: issueReports.reduce((s, r) => s + r.issues.length, 0), countLabel: 'תקלות' },
  ]

  return (
    <div style={{ paddingTop: '68px', padding: '68px 16px 80px', maxWidth: '600px', margin: '0 auto' }}>
      <BackButton />

      <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '4px' , textAlign: 'center'}}>חמ"ל</h1>
      <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px', marginBottom: '20px' , textAlign: 'center'}}>
        {checkins.length} דיווחים | {totalPeople} נפשות במקלטים
      </p>

      {/* Reports directly */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
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
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-accent)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(77, 166, 232, 0.2)'}
          >
            <span style={{ fontSize: '28px' }}>{card.icon}</span>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 2px' }}>{card.label}</p>
              <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', margin: 0 , textAlign: 'center'}}>{card.desc}</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <span style={{
                fontSize: '20px', fontWeight: 800,
                color: card.count > 0 ? 'var(--color-danger)' : 'var(--color-success)',
              }}>
                {card.count}
              </span>
              <p style={{ fontSize: '9px', color: 'var(--color-text-secondary)', margin: '2px 0 0' , textAlign: 'center'}}>
                {card.countLabel}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Quick access buttons */}
      <div style={{ display: 'flex', gap: '10px', marginTop: '95px' }}>
        <button
          onClick={() => navigate('/dashboard/sources')}
          style={{
            flex: 1, padding: '14px', background: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)', borderRadius: 'var(--radius)',
            cursor: 'pointer', textAlign: 'center',
          }}
        >
          <span style={{ fontSize: '20px' }}>📋</span>
          <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-accent)', margin: '4px 0 0' }}>טבלאות מקור</p>
        </button>
        <button
          onClick={() => navigate('/dashboard/history')}
          style={{
            flex: 1, padding: '14px', background: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)', borderRadius: 'var(--radius)',
            cursor: 'pointer', textAlign: 'center',
          }}
        >
          <span style={{ fontSize: '20px' }}>📜</span>
          <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-warning)', margin: '4px 0 0' }}>היסטוריה</p>
        </button>
      </div>
    </div>
  )
}
