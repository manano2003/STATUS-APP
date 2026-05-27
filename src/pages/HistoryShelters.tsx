import { useNavigate } from 'react-router-dom'
import { getRegularShelters } from '../data/shelters'
import { useStore } from '../data/store'
import PageLayout from '../components/PageLayout'

export default function HistoryShelters() {
  const navigate = useNavigate()
  const { shelterHistory } = useStore()
  const regularShelters = getRegularShelters()

  return (
    <PageLayout title="🏛️ היסטוריית נוכחות במקלטים" subtitle={`סה"כ ${shelterHistory.length} רישומים`} backTo="/dashboard/history">

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {regularShelters.map(shelter => {
          const snapshots = shelterHistory.filter(s => s.shelterId === shelter.id)
          return (
            <button
              key={shelter.id}
              onClick={() => navigate(`/dashboard/history/shelters/${shelter.id}`)}
              style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                padding: '14px', background: 'var(--color-bg-card)',
                border: '1px solid var(--color-border)', borderRadius: 'var(--radius)',
                cursor: 'pointer', textAlign: 'right', color: 'var(--color-text)',
                transition: 'border-color 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-accent)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(77, 166, 232, 0.2)'}
            >
              <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', minWidth: '20px' }}>
                {shelter.number}
              </span>
              <span style={{ fontSize: '14px', fontWeight: 700, flex: 1 }}>{shelter.name}</span>
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
