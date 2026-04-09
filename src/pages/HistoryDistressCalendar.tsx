import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getDistressTypeInfo } from '../data/distressTypes'
import { useStore, type DistressType } from '../data/store'
import BackButton from '../components/BackButton'

const MONTHS_HE = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר']
const DAYS_HE = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳']

export default function HistoryDistressCalendar() {
  const { type } = useParams<{ type: string }>()
  const navigate = useNavigate()
  const { distressHistory } = useStore()

  const typeInfo = type ? getDistressTypeInfo(type as DistressType) : undefined
  if (!typeInfo) return <div style={{ paddingTop: '100px', textAlign: 'center' }}>סוג אירוע לא נמצא</div>

  const entries = distressHistory.filter(e => e.type === typeInfo.id)

  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDayOfWeek = new Date(year, month, 1).getDay()

  const dayHasData = (day: number) =>
    entries.some(e => {
      const d = new Date(e.deletedAt)
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day
    })

  return (
    <div style={{ paddingTop: '68px', padding: '68px 16px 100px', maxWidth: '400px', margin: '0 auto' }}>
      <BackButton to="/dashboard/history/distress" />

      <h1 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '4px', textAlign: 'center' }}>
        {typeInfo.label} — היסטוריה
      </h1>
      <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px', marginBottom: '16px', textAlign: 'center' }}>
        {entries.length} קריאות
      </p>

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
                onClick={() => hasData ? navigate(`/dashboard/history/distress/${typeInfo.id}/${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`) : null}
                style={{
                  width: '32px', height: '32px', borderRadius: '50%', border: 'none',
                  background: 'transparent',
                  color: hasData ? 'var(--color-text)' : 'var(--color-text-secondary)',
                  fontWeight: hasData ? 800 : 400, fontSize: '13px',
                  cursor: hasData ? 'pointer' : 'default',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >{day}</button>
              <span style={{
                width: '6px', height: '6px', borderRadius: '50%',
                background: hasData ? 'var(--color-danger)' : 'var(--color-success)',
              }} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
