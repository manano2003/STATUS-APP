import { useNavigate } from 'react-router-dom'
import { getSourceClubs } from '../data/sourceData'
import { useStore } from '../data/store'
import PageLayout from '../components/PageLayout'

export default function HistoryClubs() {
  const navigate = useNavigate()
  const { clubHistory } = useStore()
  const clubs = getSourceClubs()

  return (
    <PageLayout title="היסטוריית נוכחות במועדונים" subtitle={`סה"כ ${clubHistory.length} רישומים`} backTo="/dashboard/history">

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {clubs.map(club => {
          const snapshots = clubHistory.filter(s => s.kindergartenId === club.id)
          return (
            <button
              key={club.id}
              onClick={() => navigate(`/dashboard/history/clubs/${club.id}`)}
              style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                padding: '16px', background: 'var(--color-bg-card)',
                border: '1px solid var(--color-border)', borderRadius: 'var(--radius)',
                cursor: 'pointer', textAlign: 'right', color: 'var(--color-text)',
                transition: 'border-color 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-accent)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(77, 166, 232, 0.2)'}
            >
              <span style={{ fontSize: '15px', fontWeight: 700, flex: 1 }}>{club.name}</span>
              <span style={{
                fontSize: '13px', fontWeight: 800,
                color: snapshots.length > 0 ? 'var(--color-accent)' : 'var(--color-text-secondary)',
              }}>
                {snapshots.length} ימים
              </span>
            </button>
          )
        })}
      </div>
    </PageLayout>
  )
}
