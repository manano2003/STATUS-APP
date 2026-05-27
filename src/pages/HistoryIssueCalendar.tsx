import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getShelterById } from '../data/shelters'
import { useStore } from '../data/store'
import PageLayout from '../components/PageLayout'

const MONTHS_HE = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר']
const DAYS_HE = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳']

export default function HistoryIssueCalendar() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { issueHistory } = useStore()
  const shelter = id ? getShelterById(id) : undefined

  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())

  if (!shelter) return <div style={{ paddingTop: '100px', textAlign: 'center' }}>מקלט לא נמצא</div>

  const entries = issueHistory.filter(e => e.shelterId === shelter.id)
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDayOfWeek = new Date(year, month, 1).getDay()

  const dayHasData = (day: number) =>
    entries.some(e => {
      const d = new Date(e.resolvedAt)
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day
    })

  return (
    <PageLayout title={`${shelter.name} — תקלות`} subtitle={`${entries.length} תיקונים`} backTo="/dashboard/history/issues">

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '16px' }}>
        <button onClick={() => setYear(year - 1)} style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', fontSize: '16px', cursor: 'pointer' }}>«</button>
        <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-accent)' }}>{year}</span>
        <button onClick={() => setYear(year + 1)} style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', fontSize: '16px', cursor: 'pointer' }}>»</button>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '20px' }}>
        <button onClick={() => { if (month === 0) { setMonth(11); setYear(year - 1) } else setMonth(month - 1) }} style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', fontSize: '16px', cursor: 'pointer' }}>‹</button>
        <span style={{ fontSize: '16px', fontWeight: 700, minWidth: '80px', textAlign: 'center' }}>{MONTHS_HE[month]}</span>
        <button onClick={() => { if (month === 11) { setMonth(0); setYear(year + 1) } else setMonth(month + 1) }} style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', fontSize: '16px', cursor: 'pointer' }}>›</button>
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px',
        background: 'var(--color-bg-card)', borderRadius: 'var(--radius)',
        border: '1px solid var(--color-border)', padding: '12px',
      }}>
        {DAYS_HE.map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: '11px', fontWeight: 700, color: 'var(--color-text-secondary)', padding: '4px 0' }}>{d}</div>
        ))}
        {Array.from({ length: firstDayOfWeek }, (_, i) => <div key={`e-${i}`} />)}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1
          const hasData = dayHasData(day)
          return (
            <div key={day} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
              <button
                onClick={() => hasData ? navigate(`/dashboard/history/issues/${shelter.id}/${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`) : null}
                style={{
                  width: '32px', height: '44px', borderRadius: '8px', border: 'none',
                  background: 'transparent',
                  color: hasData ? 'var(--color-text)' : 'var(--color-text-secondary)',
                  fontWeight: hasData ? 800 : 400, fontSize: '13px',
                  cursor: hasData ? 'pointer' : 'default',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span>{day}</span>
                  {hasData && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-success)', marginTop: '2px' }} />}
                </div>
              </button>
            </div>
          )
        })}
      </div>
    </PageLayout>
  )
}
