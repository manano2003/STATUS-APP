import { useNavigate } from 'react-router-dom'
import { useStore } from '../data/store'
import PageLayout from '../components/PageLayout'

export default function Backup() {
  const navigate = useNavigate()
  const { backupUsers, backupKindergartens, backupClubs, backupResidents } = useStore()

  const cards = [
    { label: 'משתמשים', count: backupUsers.length, path: '/dashboard/backup/users' },
    { label: 'גנים', count: backupKindergartens.length, path: '/dashboard/backup/kindergartens' },
    { label: 'מועדונים', count: backupClubs.length, path: '/dashboard/backup/clubs' },
    { label: 'סטאטוס תושבים בחירום', count: backupResidents.length, path: '/dashboard/backup/residents' },
  ]

  return (
    <PageLayout title="גיבוי" subtitle={`${backupUsers.length + backupKindergartens.length + backupClubs.length + backupResidents.length} פריטים בגיבוי`} backTo="/dashboard">

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
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
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-accent)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(77, 166, 232, 0.2)'}
          >
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>{card.label}</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <span style={{
                fontSize: '20px', fontWeight: 800,
                color: card.count > 0 ? 'var(--color-warning)' : 'var(--color-text-secondary)',
              }}>
                {card.count}
              </span>
              <p style={{ fontSize: '9px', color: 'var(--color-text-secondary)', margin: '2px 0 0', textAlign: 'center' }}>
                בגיבוי
              </p>
            </div>
          </button>
        ))}
      </div>
    </PageLayout>
  )
}
