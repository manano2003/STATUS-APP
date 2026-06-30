import { useParams, useNavigate } from 'react-router-dom'
import PageLayout from '../components/PageLayout'

const councilNames: Record<string, string> = {
  'mateh-yehuda': 'מטה יהודה',
}

export default function CouncilCategories() {
  const { councilId } = useParams<{ councilId: string }>()
  const navigate = useNavigate()
  const councilName = councilId ? councilNames[councilId] || councilId : ''

  const categories = [
    { id: 'schools', name: 'מוסדות חינוך', icon: '🏫', path: `/schools/council/${councilId}/schools` },
    { id: 'camps', name: 'קייטנות', icon: '🏕️', path: `/schools/council/${councilId}/camps` },
  ]

  return (
    <PageLayout title={councilName} backTo="/schools/councils">
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center',
      }}>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => navigate(cat.path)}
            style={{
              background: 'var(--color-bg-card)', border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius)', width: '160px', padding: '32px 16px',
              cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-accent)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-glow)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
          >
            <span style={{ fontSize: '48px', display: 'block', marginBottom: '12px' }}>{cat.icon}</span>
            <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-text)' }}>{cat.name}</span>
          </button>
        ))}
      </div>
    </PageLayout>
  )
}
