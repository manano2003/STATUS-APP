import { useNavigate } from 'react-router-dom'
import { useStore } from '../data/store'
import PageLayout from '../components/PageLayout'

const PERMISSION_TYPES = [
  { id: 'חמ"ל', label: 'חמ"ל', color: 'var(--color-accent)', icon: '📊' },
  { id: 'גננת', label: 'גנים', color: 'var(--color-success)', icon: '👶' },
  { id: 'מועדונים', label: 'מועדונים', color: 'var(--color-warning)', icon: '⚽' },
  { id: 'מנהל מקלט', label: 'מנהל מקלט', color: '#9b59b6', icon: '🏛️' },
  { id: 'מנהלת גנים', label: 'מנהלת גנים', color: '#2ecc71', icon: '👶+' },
  { id: 'מנהלת מועדונים', label: 'מנהלת מועדונים', color: '#e67e22', icon: '⚽+' },
  { id: 'מס"ר', label: 'מס"ר (מרכז סיוע ראשוני)', color: '#e74c3c', icon: '📋' },
]

export default function Permissions() {
  const navigate = useNavigate()
  const { users } = useStore()

  return (
    <PageLayout title="🔒 הרשאות" backTo="/dashboard/users">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {PERMISSION_TYPES.map(perm => {
          const count = users.filter(u => u.roles.includes(perm.id)).length
          return (
            <button
              key={perm.id}
              onClick={() => navigate(`/dashboard/permissions/${encodeURIComponent(perm.id)}`)}
              style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                padding: '16px', background: 'var(--color-bg-card)',
                border: '1px solid var(--color-border)', borderRadius: 'var(--radius)',
                cursor: 'pointer', textAlign: 'right', color: 'var(--color-text)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = perm.color}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(77, 166, 232, 0.2)'}
            >
              <span style={{ fontSize: '28px' }}>{perm.icon}</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>{perm.label}</p>
                <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '2px 0 0' }}>
                  {count} משתמשים
                </p>
              </div>
              <span style={{
                fontSize: '20px', fontWeight: 800, color: perm.color,
              }}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div style={{
        marginTop: '32px',
        background: 'var(--color-bg-card)',
        borderRadius: 'var(--radius)',
        border: '1px solid var(--color-border)',
        overflow: 'hidden',
      }}>
        <div style={{
          padding: '14px 16px',
          borderBottom: '1px solid var(--color-border)',
          fontSize: '16px',
          fontWeight: 800,
          color: 'var(--color-accent)',
          textAlign: 'center',
        }}>
          מפתח הרשאות
        </div>
        {[
          { icon: '📊', label: 'חמ"ל', color: 'var(--color-accent)', desc: 'גישה לכל הטאבים של הישוב כולל טאב חמ"ל — תמונת מצב מלאה, דוחות, היסטוריה וטבלאות מקור.' },
          { icon: '👶', label: 'גנים', color: 'var(--color-success)', desc: 'גישה לטאב הגנים (דיווח נוכחות ילדים) ולטאב המקלטים בלבד.' },
          { icon: '⚽', label: 'מועדונים', color: 'var(--color-warning)', desc: 'גישה לטאב המועדונים (דיווח נוכחות חברים) ולטאב המקלטים בלבד.' },
          { icon: '🏛️', label: 'מנהל מקלט', color: '#9b59b6', desc: 'גישה לטאב המקלטים ולטאב תקלות מקלטים — דיווח על בעיות תחזוקה ומצב המקלט.' },
          { icon: '👶+', label: 'מנהלת גנים', color: '#2ecc71', desc: 'גישה לטאב המקלטים, טאב הגנים, ובטאב החמ"ל רק לסיכום מצב גנים.' },
          { icon: '⚽+', label: 'מנהלת מועדונים', color: '#e67e22', desc: 'גישה לטאב המקלטים, טאב המועדונים, ובטאב החמ"ל רק לסיכום מצב מועדונים.' },
          { icon: '📋', label: 'מס"ר (מרכז סיוע ראשוני)', color: '#e74c3c', desc: 'גישה לטאב המקלטים ולטאב עדכון תושבים.' },
        ].map(item => (
          <div key={item.label} style={{
            padding: '12px 16px',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            gap: '12px',
            alignItems: 'flex-start',
          }}>
            <span style={{ fontSize: '20px', flexShrink: 0 }}>{item.icon}</span>
            <div>
              <p style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 4px', color: item.color }}>{item.label}</p>
              <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.5 }}>{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </PageLayout>
  )
}
