import { useNavigate } from 'react-router-dom'
import { kindergartens } from '../data/kindergartens'
import { useStore } from '../data/store'
import BackButton from '../components/BackButton'

export default function Kindergartens() {
  const navigate = useNavigate()
  const { getKindergartenAttendance } = useStore()

  const totalPresent = kindergartens.reduce((sum, k) => {
    const att = getKindergartenAttendance(k.id)
    return sum + (att?.presentChildren.length ?? 0)
  }, 0)

  const totalChildren = kindergartens.reduce((sum, k) => sum + k.children.length, 0)

  return (
    <div style={{ paddingTop: '68px', padding: '68px 16px 80px', maxWidth: '600px', margin: '0 auto' }}>
      <BackButton />

      <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '4px', textAlign: 'center' }}>
        גני ילדים
      </h1>
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
          const present = att?.presentChildren.length ?? 0
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
              <p style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-text)', margin: '0 0 6px' }}>
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
    </div>
  )
}
