import { useNavigate } from 'react-router-dom'
import { getSourceKindergartens } from '../data/sourceData'
import { useStore } from '../data/store'
import PageLayout from '../components/PageLayout'

export default function HistoryKindergartens() {
  const navigate = useNavigate()
  const { kindergartenHistory } = useStore()
  const kindergartens = getSourceKindergartens()

  return (
    <PageLayout title="👶 היסטוריית נוכחות בגנים" subtitle={`סה"כ ${kindergartenHistory.length} רישומים`} backTo="/dashboard/history">

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {kindergartens.map(kg => {
          const snapshots = kindergartenHistory.filter(s => s.kindergartenId === kg.id)
          return (
            <button
              key={kg.id}
              onClick={() => navigate(`/dashboard/history/kindergartens/${kg.id}`)}
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
              <span style={{ fontSize: '15px', fontWeight: 700, flex: 1 }}>{kg.name}</span>
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
