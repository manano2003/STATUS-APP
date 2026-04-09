import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getClubById } from '../data/clubs'
import { useStore } from '../data/store'
import BackButton from '../components/BackButton'

const MONTHS_HE = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר']
const DAYS_HE = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳']

export default function HistoryClubCalendar() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { clubHistory } = useStore()
  const club = id ? getClubById(id) : undefined

  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())

  if (!club) return <div style={{ paddingTop: '100px', textAlign: 'center' }}>מועדון לא נמצא</div>

  const snapshots = clubHistory.filter(s => s.kindergartenId === club.id)
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDayOfWeek = new Date(year, month, 1).getDay()

  const daysWithData = new Set(
    snapshots
      .filter(s => {
        const d = new Date(s.date)
        return d.getFullYear() === year && d.getMonth() === month
      })
      .map(s => new Date(s.date).getDate())
  )

  const goToDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    navigate(`/dashboard/history/clubs/${club.id}/${dateStr}`)
  }

  return (
    <div style={{ paddingTop: '68px', padding: '68px 16px 100px', maxWidth: '400px', margin: '0 auto' }}>
      <BackButton to="/dashboard/history/clubs" />

      <h1 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '16px', textAlign: 'center' }}>
        {club.name} — היסטוריה
      </h1>

      {/* Year/Month selector */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
        marginBottom: '16px',
      }}>
        <button onClick={() => setYear(year - 1)} style={{
          background: 'none', border: 'none', color: 'var(--color-text-secondary)', fontSize: '16px', cursor: 'pointer',
        }}>«</button>
        <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-accent)', minWidth: '40px', textAlign: 'center' }}>
          {year}
        </span>
        <button onClick={() => setYear(year + 1)} style={{
          background: 'none', border: 'none', color: 'var(--color-text-secondary)', fontSize: '16px', cursor: 'pointer',
        }}>»</button>
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
        marginBottom: '20px',
      }}>
        <button onClick={() => { if (month === 0) { setMonth(11); setYear(year - 1) } else setMonth(month - 1) }} style={{
          background: 'none', border: 'none', color: 'var(--color-text-secondary)', fontSize: '16px', cursor: 'pointer',
        }}>‹</button>
        <span style={{ fontSize: '16px', fontWeight: 700, minWidth: '80px', textAlign: 'center' }}>
          {MONTHS_HE[month]}
        </span>
        <button onClick={() => { if (month === 11) { setMonth(0); setYear(year + 1) } else setMonth(month + 1) }} style={{
          background: 'none', border: 'none', color: 'var(--color-text-secondary)', fontSize: '16px', cursor: 'pointer',
        }}>›</button>
      </div>

      {/* Calendar grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px',
        background: 'var(--color-bg-card)', borderRadius: 'var(--radius)',
        border: '1px solid var(--color-border)', padding: '12px',
      }}>
        {/* Day headers */}
        {DAYS_HE.map(d => (
          <div key={d} style={{
            textAlign: 'center', fontSize: '11px', fontWeight: 700,
            color: 'var(--color-text-secondary)', padding: '4px 0',
          }}>
            {d}
          </div>
        ))}

        {/* Empty cells before first day */}
        {Array.from({ length: firstDayOfWeek }, (_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {/* Day cells */}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1
          const hasData = daysWithData.has(day)
          return (
            <button
              key={day}
              onClick={() => hasData ? goToDay(day) : null}
              style={{
                width: '36px', height: '36px', borderRadius: '50%',
                border: 'none',
                background: hasData ? 'rgba(77, 166, 232, 0.2)' : 'transparent',
                color: hasData ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                fontWeight: hasData ? 800 : 400,
                fontSize: '13px',
                cursor: hasData ? 'pointer' : 'default',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto',
              }}
            >
              {day}
            </button>
          )
        })}
      </div>
    </div>
  )
}
