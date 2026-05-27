import { useNavigate } from 'react-router-dom'
import { useStore } from '../data/store'
import { getRegularShelters, getSpecialStatuses } from '../data/shelters'
import { getSourceKindergartens, getSourceClubs } from '../data/sourceData'
import { hasPermission } from '../data/permissions'
import PageLayout from '../components/PageLayout'

export default function Dashboard() {
  const navigate = useNavigate()
  const { currentUser, checkins, getShelterPeopleCount, distressAlerts, issueReports, getKindergartenAttendance, getClubAttendance, emergencyStatuses } = useStore()

  const kindergartens = getSourceKindergartens()
  const clubs = getSourceClubs()
  const regularShelters = getRegularShelters()
  const specialStatuses = getSpecialStatuses()
  const totalPeople = [...regularShelters, ...specialStatuses].reduce((sum, s) => sum + getShelterPeopleCount(s.id), 0)
  const totalKidsPresent = kindergartens.reduce((sum, k) => {
    const att = getKindergartenAttendance(k.id)
    return att ? sum + att.presentChildren.filter(name => k.children.includes(name)).length : sum
  }, 0)
  const totalClubPresent = clubs.reduce((sum, c) => {
    const att = getClubAttendance(c.id)
    return att ? sum + att.presentChildren.filter(name => c.children.includes(name)).length : sum
  }, 0)

  const userRoles = currentUser?.roles ?? []

  const allReports = [
    { icon: '🏛️', label: 'נוכחות במקלטים', desc: 'מצב מקלטים בזמן אמת', path: '/dashboard/shelters', count: totalPeople, countLabel: 'נפשות', feature: 'dashboard-shelters' },
    { icon: '👶', label: 'נוכחות בגנים', desc: 'נוכחות ילדים בגנים', path: '/dashboard/kindergartens', count: totalKidsPresent, countLabel: 'ילדים', feature: 'dashboard-kindergartens' },
    { icon: '⚽', label: 'נוכחות במועדונים', desc: 'נוכחות במועדונים', path: '/dashboard/clubs', count: totalClubPresent, countLabel: 'חניכים', feature: 'dashboard-clubs' },
    { icon: '🚨', label: 'עדכון סטאטוס תושבים בחירום', desc: 'מצב תושבים באירוע חירום', path: '/dashboard/emergency', count: emergencyStatuses.length, countLabel: 'עודכנו', feature: 'dashboard-emergency' },
    { icon: '🆘', label: 'קריאות מצוקה', desc: 'קריאות מצוקה פעילות', path: '/dashboard/distress', count: distressAlerts.length, countLabel: 'קריאות', feature: 'dashboard-distress' },
    { icon: '🔧', label: 'תקלות במקלטים', desc: 'דיווחי תקלות ותחזוקה', path: '/dashboard/issues', count: issueReports.reduce((s, r) => s + r.issues.length, 0), countLabel: 'תקלות', feature: 'dashboard-issues' },
  ]

  const reports = allReports.filter(r => hasPermission(userRoles, r.feature))

  return (
    <PageLayout title="חמ&quot;ל" subtitle={`${checkins.length} דיווחים | ${totalPeople} נפשות במקלטים`}>

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
            <span style={{ fontSize: '28px', width: '40px', textAlign: 'center', flexShrink: 0 }}>{card.icon}</span>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 2px', textAlign: 'right' }}>{card.label}</p>
              <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', margin: 0, textAlign: 'right' }}>{card.desc}</p>
            </div>
            <div style={{ width: '50px', textAlign: 'center', flexShrink: 0 }}>
              <span style={{
                fontSize: '20px', fontWeight: 800,
                color: card.count > 0 ? 'var(--color-danger)' : 'var(--color-success)',
              }}>
                {card.count}
              </span>
              <p style={{ fontSize: '9px', color: 'var(--color-text-secondary)', margin: '2px 0 0', textAlign: 'center' }}>
                {card.countLabel}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Quick access buttons - only for חמ"ל and ADMIN */}
      {hasPermission(userRoles, 'dashboard-sources') && (
        <div style={{ display: 'flex', gap: '10px', marginTop: '95px', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/dashboard/sources')}
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
            onClick={() => navigate('/dashboard/history')}
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
            onClick={() => navigate('/dashboard/backup')}
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
      )}
    </PageLayout>
  )
}
