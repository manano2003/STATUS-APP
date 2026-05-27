import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { getClubById } from '../data/sourceData'
import { useStore } from '../data/store'
import Button from '../components/Button'
import PageLayout from '../components/PageLayout'

export default function ClubCheckin() {
  const { id } = useParams<{ id: string }>()
  const { currentUser, getClubAttendance, setClubAttendance } = useStore()

  const club = id ? getClubById(id) : undefined
  if (!club) return <div style={{ paddingTop: '100px', textAlign: 'center' }}>מועדון לא נמצא</div>

  const existing = getClubAttendance(club.id)
  const [checked, setChecked] = useState<Set<string>>(() => {
    if (existing) return new Set(existing.presentChildren)
    return new Set(club.children)
  })
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
    setClubAttendance({
      kindergartenId: club.id,
      presentChildren: Array.from(checked),
      timestamp: Date.now(),
      reportedBy: currentUser?.fullName ?? 'מדריך',
    })
    setSaved(true)
  }

  return (
    <PageLayout title={club.name} backTo="/clubs">
      {(() => {
        const presentKids = club.children.filter(c => checked.has(c)).length
        const pct = club.children.length > 0 ? Math.round((presentKids / club.children.length) * 100) : 0
        return (
          <>
            <p style={{ color: 'var(--color-accent)', fontSize: '18px', fontWeight: 800, marginBottom: '4px', textAlign: 'center' }}>
              נוכחים: {presentKids} מתוך {club.children.length}
            </p>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px', marginBottom: '16px', textAlign: 'center' }}>
              {pct}% נוכחות
            </p>
          </>
        )
      })()}

      <div style={{
        background: 'var(--color-bg-card)',
        borderRadius: 'var(--radius)',
        border: '1px solid var(--color-border)',
        overflow: 'hidden',
        marginBottom: '16px',
      }}>
        {club.children.map((child) => {
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
        {club.staff.length > 0 && (
          <>
            <div style={{
              padding: '10px 14px',
              background: 'rgba(77, 166, 232, 0.08)',
              borderBottom: '1px solid var(--color-border)',
              fontSize: '14px',
              fontWeight: 800,
              color: 'var(--color-accent)',
              textAlign: 'center',
            }}>
              סגל חינוכי
            </div>
            {club.staff.map((member, i) => {
              const isPresent = checked.has(member)
              return (
                <div
                  key={member}
                  onClick={() => toggle(member)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '12px 14px',
                    borderBottom: i < club.staff.length - 1 ? '1px solid var(--color-border)' : 'none',
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

      <button
        onClick={() => {
          if (confirm('האם למחוק את כל הנוכחות במועדון?')) {
            setChecked(new Set())
            setClubAttendance({
              kindergartenId: club.id,
              presentChildren: [],
              timestamp: Date.now(),
              reportedBy: currentUser?.fullName ?? 'מדריך',
            })
            setSaved(false)
          }
        }}
        style={{
          display: 'block', width: '100%', marginTop: '12px', padding: '14px',
          borderRadius: 'var(--radius)',
          border: '1px solid rgba(232, 77, 77, 0.3)',
          background: 'rgba(232, 77, 77, 0.08)',
          color: 'var(--color-danger)', fontSize: '14px', fontWeight: 700, cursor: 'pointer',
        }}
      >
        מחק נוכחות
      </button>
    </PageLayout>
  )
}
