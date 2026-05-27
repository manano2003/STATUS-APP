import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../data/supabase'
import SchoolHome from './SchoolHome'

const MONTHS_HE = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר']
const DAYS_HE = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳']

export default function SchoolHistory() {
  const { schoolId } = useParams<{ schoolId: string }>()
  const navigate = useNavigate()

  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [daysWithData, setDaysWithData] = useState<Set<number>>(new Set())

  useEffect(() => {
    if (!schoolId) return
    const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`
    const endDate = `${year}-${String(month + 1).padStart(2, '0')}-31`
    supabase.from('school_attendance').select('date')
      .eq('school_id', schoolId)
      .gte('date', startDate)
      .lte('date', endDate)
      .then(({ data }) => {
        if (data) {
          const days = new Set(data.map((r: any) => new Date(r.date + 'T00:00:00').getDate()))
          setDaysWithData(days)
        }
      })
  }, [schoolId, year, month])

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDayOfWeek = new Date(year, month, 1).getDay()

  const goToDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    navigate(`/schools/${schoolId}/history/${dateStr}`)
  }

  return (
    <SchoolHome backTo={`/schools/${schoolId}/management`} content={
      <>
        <p style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-accent)', textAlign: 'center', marginBottom: '16px' }}>
          היסטוריית נוכחות
        </p>

        {/* Year selector */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '16px' }}>
          <button onClick={() => setYear(year - 1)} style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', fontSize: '16px', cursor: 'pointer' }}>«</button>
          <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-accent)', minWidth: '40px', textAlign: 'center' }}>{year}</span>
          <button onClick={() => setYear(year + 1)} style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', fontSize: '16px', cursor: 'pointer' }}>»</button>
        </div>

        {/* Month selector */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '20px' }}>
          <button onClick={() => { if (month === 0) { setMonth(11); setYear(year - 1) } else setMonth(month - 1) }} style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', fontSize: '16px', cursor: 'pointer' }}>‹</button>
          <span style={{ fontSize: '16px', fontWeight: 700, minWidth: '80px', textAlign: 'center' }}>{MONTHS_HE[month]}</span>
          <button onClick={() => { if (month === 11) { setMonth(0); setYear(year + 1) } else setMonth(month + 1) }} style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', fontSize: '16px', cursor: 'pointer' }}>›</button>
        </div>

        {/* Calendar */}
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
            const hasData = daysWithData.has(day)
            return (
              <button
                key={day}
                onClick={() => hasData ? goToDay(day) : null}
                style={{
                  width: '36px', height: '44px', borderRadius: '8px', border: 'none',
                  background: 'transparent',
                  color: hasData ? 'var(--color-text)' : 'var(--color-text-secondary)',
                  fontWeight: hasData ? 800 : 400, fontSize: '13px',
                  cursor: hasData ? 'pointer' : 'default',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: '0 auto',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span>{day}</span>
                  {hasData && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-success)', marginTop: '2px' }} />}
                </div>
              </button>
            )
          })}
        </div>
      </>
    } />
  )
}
