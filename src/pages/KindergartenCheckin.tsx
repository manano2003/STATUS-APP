import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { getKindergartenById } from '../data/kindergartens'
import { useStore } from '../data/store'
import Button from '../components/Button'
import BackButton from '../components/BackButton'

export default function KindergartenCheckin() {
  const { id } = useParams<{ id: string }>()
  const { currentUser, getKindergartenAttendance, setKindergartenAttendance } = useStore()

  const kg = id ? getKindergartenById(id) : undefined
  if (!kg) return <div style={{ paddingTop: '100px', textAlign: 'center' }}>גן לא נמצא</div>

  const existing = getKindergartenAttendance(kg.id)
  const [checked, setChecked] = useState<Set<string>>(new Set(existing?.presentChildren ?? []))
  const [saved, setSaved] = useState(false)

  const toggle = (name: string) => {
    setChecked(prev => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
    setSaved(false)
  }

  const handleSave = () => {
    setKindergartenAttendance({
      kindergartenId: kg.id,
      presentChildren: Array.from(checked),
      timestamp: Date.now(),
      reportedBy: currentUser?.fullName ?? 'גננת',
    })
    setSaved(true)
  }

  return (
    <div style={{ paddingTop: '68px', padding: '68px 16px 80px', maxWidth: '500px', margin: '0 auto' }}>
      <BackButton to="/kindergartens" />

      <h1 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '4px', textAlign: 'center' }}>
        {kg.name}
      </h1>
      <p style={{ color: 'var(--color-accent)', fontSize: '18px', fontWeight: 800, marginBottom: '4px', textAlign: 'center' }}>
        נוכחים: {checked.size} מתוך {kg.children.length}
      </p>
      <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px', marginBottom: '16px', textAlign: 'center' }}>
        {kg.children.length > 0 ? Math.round((checked.size / kg.children.length) * 100) : 0}% נוכחות
      </p>

      <div style={{
        background: 'var(--color-bg-card)',
        borderRadius: 'var(--radius)',
        border: '1px solid var(--color-border)',
        overflow: 'hidden',
        marginBottom: '16px',
      }}>
        {kg.children.map((child) => {
          const isPresent = checked.has(child)
          return (
            <div
              key={child}
              onClick={() => toggle(child)}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '12px 14px',
                borderBottom: '1px solid var(--color-border)',
                cursor: 'pointer',
                background: isPresent ? 'rgba(77, 232, 138, 0.05)' : 'transparent',
              }}
            >
              <div style={{
                width: '22px', height: '22px', borderRadius: '50%',
                border: isPresent ? '2px solid var(--color-success)' : '2px solid var(--color-border)',
                background: isPresent ? 'var(--color-success)' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, transition: 'all 0.2s',
              }}>
                {isPresent && <span style={{ color: 'white', fontSize: '12px', fontWeight: 800 }}>✓</span>}
              </div>
              <span style={{
                fontSize: '14px', fontWeight: isPresent ? 700 : 400,
                color: isPresent ? 'var(--color-success)' : 'var(--color-text)',
              }}>
                {child}
              </span>
            </div>
          )
        })}

        {/* Staff separator */}
        {kg.staff.length > 0 && (
          <>
            <div style={{
              padding: '8px 14px',
              background: 'rgba(77, 166, 232, 0.08)',
              borderBottom: '1px solid var(--color-border)',
              fontSize: '12px',
              fontWeight: 800,
              color: 'var(--color-accent)',
              textAlign: 'center',
            }}>
              סגל חינוכי
            </div>
            {kg.staff.map((member, i) => {
              const isPresent = checked.has(member)
              return (
                <div
                  key={member}
                  onClick={() => toggle(member)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '12px 14px',
                    borderBottom: i < kg.staff.length - 1 ? '1px solid var(--color-border)' : 'none',
                    cursor: 'pointer',
                    background: isPresent ? 'rgba(77, 166, 232, 0.05)' : 'transparent',
                  }}
                >
                  <div style={{
                    width: '22px', height: '22px', borderRadius: '50%',
                    border: isPresent ? '2px solid var(--color-accent)' : '2px solid var(--color-border)',
                    background: isPresent ? 'var(--color-accent)' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, transition: 'all 0.2s',
                  }}>
                    {isPresent && <span style={{ color: 'white', fontSize: '12px', fontWeight: 800 }}>✓</span>}
                  </div>
                  <span style={{
                    fontSize: '14px', fontWeight: isPresent ? 700 : 400,
                    color: isPresent ? 'var(--color-accent)' : 'var(--color-text)',
                  }}>
                    {member}
                  </span>
                </div>
              )
            })}
          </>
        )}
      </div>

      <Button
        size="lg"
        style={{ width: '100%', background: saved ? 'var(--color-success)' : 'linear-gradient(135deg, var(--color-accent), #3A8FD4)' }}
        onClick={handleSave}
      >
        {saved ? '✓ הנוכחות נשמרה' : 'שמור נוכחות'}
      </Button>
    </div>
  )
}
