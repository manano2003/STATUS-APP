import { useNavigate } from 'react-router-dom'
import { getSourceKindergartens } from '../data/sourceData'
import { useStore } from '../data/store'
import PageLayout from '../components/PageLayout'

export default function Kindergartens() {
  const navigate = useNavigate()
  const { getKindergartenAttendance } = useStore()
  const kindergartens = getSourceKindergartens()

  const totalPresent = kindergartens.reduce((sum, k) => {
    const att = getKindergartenAttendance(k.id)
    if (!att) return sum
    return sum + att.presentChildren.filter(name => k.children.includes(name)).length
  }, 0)

  const totalChildren = kindergartens.reduce((sum, k) => sum + k.children.length, 0)

  return (
    <PageLayout title="גני ילדים">
      <p style={{ color: 'var(--color-accent)', fontSize: '18px', fontWeight: 800, marginBottom: '4px', textAlign: 'center' }}>
        נוכחים: {totalPresent} מתוך {totalChildren}
      </p>
      <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px', marginBottom: '20px', textAlign: 'center' }}>
        {totalChildren > 0 ? Math.round((totalPresent / totalChildren) * 100) : 0}% נוכחות
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px',
      }}>
        {kindergartens.map(k => {
          const att = getKindergartenAttendance(k.id)
          const present = att ? att.presentChildren.filter(name => k.children.includes(name)).length : 0
          return (
            <button
              key={k.id}
              onClick={() => navigate(`/kindergartens/${k.id}`)}
              style={{
                background: 'var(--color-bg-card)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius)',
                padding: '20px 14px',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--color-accent)'
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(77, 166, 232, 0.2)'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              <p style={{ fontSize: '32px', fontWeight: 800, color: 'var(--color-text)', margin: '0 0 6px' }}>
                {k.name}
              </p>
              <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: 0 }}>
                <span style={{ color: present > 0 ? 'var(--color-accent)' : 'var(--color-text-secondary)', fontWeight: 800 }}>
                  {present}
                </span>
                /{k.children.length} נוכחים
              </p>
            </button>
          )
        })}
      </div>
    </PageLayout>
  )
}
