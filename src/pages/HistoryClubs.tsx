import { useNavigate } from 'react-router-dom'
import { clubs } from '../data/clubs'
import { useStore } from '../data/store'
import BackButton from '../components/BackButton'

export default function HistoryClubs() {
  const navigate = useNavigate()
  const { clubHistory } = useStore()

  return (
    <div style={{ paddingTop: '68px', padding: '68px 16px 100px', maxWidth: '600px', margin: '0 auto' }}>
      <BackButton to="/dashboard/history" />

      <h1 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '4px', textAlign: 'center' }}>
        היסטוריית נוכחות במועדונים
      </h1>
      <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px', marginBottom: '16px', textAlign: 'center' }}>
        סה"כ <span style={{ color: 'var(--color-accent)', fontWeight: 800 }}>{clubHistory.length}</span> רישומים
      </p>

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
    </div>
  )
}
