import { useState } from 'react'
import Button from '../components/Button'

const statuses = [
  { id: 'shelter', label: 'בממ"ד', icon: '🛡️', desc: 'אני במרחב מוגן' },
  { id: 'home_no_shelter', label: 'בבית ללא ממ"ד', icon: '🏠', desc: 'אני בבית ללא מרחב מוגן' },
  { id: 'public_shelter', label: 'במקלט ציבורי', icon: '🏛️', desc: 'אני במקלט ציבורי' },
  { id: 'outside', label: 'מחוץ לישוב', icon: '🚗', desc: 'אני מחוץ לישוב' },
  { id: 'distress', label: 'מצוקה', icon: '🆘', desc: 'אני זקוק/ה לעזרה' },
]

export default function Report() {
  const [selected, setSelected] = useState<string | null>(null)
  const [people, setPeople] = useState(1)
  const [submitted, setSubmitted] = useState(false)

  if (submitted) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '16px',
        padding: '24px',
        textAlign: 'center',
      }}>
        <span style={{ fontSize: '64px' }}>✅</span>
        <h1 style={{ fontSize: '28px', fontWeight: 800 }}>הדיווח נקלט בהצלחה</h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '16px' }}>
          הסטטוס שלך עודכן בחמ"ל
        </p>
        <Button size="lg" onClick={() => { setSubmitted(false); setSelected(null) }} style={{ marginTop: '16px' }}>
          דיווח חדש
        </Button>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '80px 24px 24px',
    }}>
      <div style={{ width: '100%', maxWidth: '500px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px' }}>דיווח סטטוס</h1>
          <p style={{ color: 'var(--color-text-secondary)' }}>בחר את מצבך הנוכחי</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
          {statuses.map(s => (
            <button
              key={s.id}
              onClick={() => setSelected(s.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '16px 20px',
                borderRadius: 'var(--radius)',
                border: selected === s.id ? '2px solid var(--color-accent)' : '1px solid var(--color-border)',
                background: selected === s.id ? 'rgba(77, 166, 232, 0.1)' : 'var(--color-bg-card)',
                cursor: 'pointer',
                textAlign: 'right',
                color: 'var(--color-text)',
                transition: 'all 0.2s ease',
                ...(s.id === 'distress' && selected === s.id ? {
                  borderColor: 'var(--color-danger)',
                  background: 'rgba(232, 77, 77, 0.1)',
                } : {}),
              }}
            >
              <span style={{ fontSize: '28px' }}>{s.icon}</span>
              <div>
                <p style={{
                  fontWeight: 700,
                  fontSize: '16px',
                  color: s.id === 'distress' ? 'var(--color-danger)' : 'var(--color-text)',
                }}>
                  {s.label}
                </p>
                <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>{s.desc}</p>
              </div>
            </button>
          ))}
        </div>

        {selected && selected !== 'distress' && (
          <div style={{
            background: 'var(--color-bg-card)',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--color-border)',
            padding: '20px',
            marginBottom: '24px',
          }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '12px', color: 'var(--color-text-secondary)' }}>
              כמה אנשים שוהים איתך?
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', justifyContent: 'center' }}>
              <button
                onClick={() => setPeople(Math.max(1, people - 1))}
                style={{
                  width: '44px', height: '44px', borderRadius: '50%',
                  border: '1px solid var(--color-border)', background: 'var(--color-bg-secondary)',
                  color: 'var(--color-text)', fontSize: '20px', cursor: 'pointer',
                }}
              >
                −
              </button>
              <span style={{ fontSize: '32px', fontWeight: 800, minWidth: '48px', textAlign: 'center' }}>
                {people}
              </span>
              <button
                onClick={() => setPeople(people + 1)}
                style={{
                  width: '44px', height: '44px', borderRadius: '50%',
                  border: '1px solid var(--color-border)', background: 'var(--color-bg-secondary)',
                  color: 'var(--color-text)', fontSize: '20px', cursor: 'pointer',
                }}
              >
                +
              </button>
            </div>
          </div>
        )}

        <Button
          size="lg"
          variant={selected === 'distress' ? 'danger' : 'primary'}
          disabled={!selected}
          onClick={() => setSubmitted(true)}
          style={{
            width: '100%',
            opacity: selected ? 1 : 0.5,
          }}
        >
          {selected === 'distress' ? '🆘 שלח קריאת מצוקה' : 'שלח דיווח'}
        </Button>
      </div>
    </div>
  )
}
