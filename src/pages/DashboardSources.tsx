import { useNavigate } from 'react-router-dom'
import { useStore } from '../data/store'
import { getSourceKindergartens, getSourceClubs, getSourceShelters, getSourceResidents } from '../data/sourceData'
import { getIssueChecklist } from '../data/shelterIssues'
import { getRegularShelters } from '../data/shelters'
import PageLayout from '../components/PageLayout'

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
  const kindergartens = getSourceKindergartens()
  const clubs = getSourceClubs()
  const sourceShelters = getSourceShelters()
  const regularShelters = getRegularShelters()
  const shelterCount = sourceShelters.length > 0 ? sourceShelters.filter(s => !s.isSpecialStatus).length : regularShelters.length
  const sourceResidents = getSourceResidents()
  const registeredNames = users.map(u => u.fullName).filter(Boolean)
  const mergedResidents = Array.from(new Set([...sourceResidents, ...registeredNames]))
  const residentsCount = mergedResidents.length
  const issuesCount = getIssueChecklist().length

  const sources: SourceCard[] = [
    { icon: '👥', label: 'רשומים במערכת', description: 'כל המשתמשים הרשומים ופרטיהם', path: '/dashboard/users', count: users.length },
    { icon: '👶', label: 'ילדים בגנים', description: 'רשימות ילדים לפי גן', path: '/dashboard/sources/kindergartens', count: kindergartens.reduce((s, k) => s + k.children.length, 0) },
    { icon: '⚽', label: 'מועדונים', description: 'חברי מועדונים וקבוצות ספורט', path: '/dashboard/sources/clubs', count: clubs.reduce((s, c) => s + c.children.length, 0) },
    { icon: '🏛️', label: 'רשימת מקלטים', description: 'ניהול רשימת המקלטים והסטטוסים', path: '/dashboard/sources/shelters', count: shelterCount },
    { icon: '▣', label: 'ברקודים למקלטים', description: 'הדפסת QR לכל מקלט', path: '/dashboard/qrcodes', count: regularShelters.length },
    { icon: '🚨', label: 'עדכון תושבים', description: 'רשימת תושבים לעדכון סטטוס חירום', path: '/dashboard/sources/residents', count: residentsCount },
    { icon: '🔧', label: 'רשימת תקלות מקלטים', description: 'רשימת תקלות אפשריות לדיווח', path: '/dashboard/sources/issues', count: issuesCount },
  ]

  const comingSoon: { icon: string; label: string; description: string }[] = [
  ]

  return (
    <PageLayout title="📋 טבלאות מקור" backTo="/dashboard">

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
            <span style={{ fontSize: '28px', width: '40px', textAlign: 'center', flexShrink: 0 }}>{card.icon}</span>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 2px', textAlign: 'right' }}>{card.label}</p>
              <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: 0, textAlign: 'right' }}>{card.description}</p>
            </div>
            {card.count !== undefined && (
              <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-accent)', width: '40px', textAlign: 'center', flexShrink: 0 }}>
                {card.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Coming soon items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
        {comingSoon.map(card => (
          <div
            key={card.label}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              padding: '16px',
              background: 'var(--color-bg-card)',
              border: '1px solid rgba(232, 77, 77, 0.3)',
              borderRadius: 'var(--radius)',
              textAlign: 'right',
              opacity: 0.7,
            }}
          >
            <span style={{ fontSize: '28px', width: '40px', textAlign: 'center', flexShrink: 0 }}>{card.icon}</span>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 2px', textAlign: 'right', color: 'var(--color-danger)' }}>{card.label}</p>
              <p style={{ fontSize: '12px', color: 'var(--color-danger)', margin: 0, textAlign: 'right' }}>{card.description}</p>
            </div>
          </div>
        ))}
      </div>
    </PageLayout>
  )
}
