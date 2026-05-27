import { useState } from 'react'
import { getSourceClubs } from '../data/sourceData'
import { useStore } from '../data/store'
import PageLayout from '../components/PageLayout'

const MONTHS_HE = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר']
const DAYS_HE = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳']

export default function HistoryClubs() {
  const { clubHistory } = useStore()
  const clubs = getSourceClubs()

  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [expandedClub, setExpandedClub] = useState<string | null>(null)

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDayOfWeek = new Date(year, month, 1).getDay()

  const daysWithData = new Set(
    clubHistory
      .filter(s => { const d = new Date(s.date); return d.getFullYear() === year && d.getMonth() === month })
      .map(s => new Date(s.date).getDate())
  )

  const daySnapshots = selectedDay
    ? clubHistory.filter(s => s.date === selectedDay)
    : []

  return (
    <PageLayout title="היסטוריית נוכחות במועדונים" backTo="/dashboard/history">

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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', background: 'var(--color-bg-card)', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)', padding: '12px', marginBottom: '16px' }}>
        {DAYS_HE.map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: '11px', fontWeight: 700, color: 'var(--color-text-secondary)', padding: '4px 0' }}>{d}</div>
        ))}
        {Array.from({ length: firstDayOfWeek }, (_, i) => <div key={`e-${i}`} />)}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1
          const hasData = daysWithData.has(day)
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const isSelected = selectedDay === dateStr
          return (
            <button key={day} onClick={() => { if (hasData) { setSelectedDay(isSelected ? null : dateStr); setExpandedClub(null) } }}
              style={{ width: '36px', height: '44px', borderRadius: '8px', border: isSelected ? '2px solid var(--color-accent)' : 'none', background: isSelected ? 'rgba(77, 166, 232, 0.15)' : 'transparent', color: hasData ? 'var(--color-text)' : 'var(--color-text-secondary)', fontWeight: hasData ? 800 : 400, fontSize: '13px', cursor: hasData ? 'pointer' : 'default', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
              <span>{day}</span>
              {hasData && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-success)', marginTop: '2px' }} />}
            </button>
          )
        })}
      </div>

      {/* Day details */}
      {selectedDay && (
        <>
          <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-accent)', textAlign: 'center', marginBottom: '12px' }}>
            {new Date(selectedDay + 'T00:00:00').toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {clubs.map(club => {
              const snapshot = daySnapshots.find(s => s.kindergartenId === club.id)
              if (!snapshot) return null
              const isExpanded = expandedClub === club.id
              return (
                <div key={club.id}>
                  <button onClick={() => setExpandedClub(isExpanded ? null : club.id)} style={{
                    display: 'flex', alignItems: 'center', gap: '14px', width: '100%',
                    padding: '14px', background: 'var(--color-bg-card)',
                    border: `1px solid ${isExpanded ? 'var(--color-accent)' : 'var(--color-border)'}`, borderRadius: 'var(--radius)',
                    cursor: 'pointer', textAlign: 'right', color: 'var(--color-text)',
                  }}>
                    <span style={{ fontSize: '15px', fontWeight: 700, flex: 1 }}>{club.name}</span>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--color-success)' }}>
                      {snapshot.presentChildren.length} נוכחים
                    </span>
                  </button>
                  {isExpanded && (
                    <div style={{ background: 'rgba(255,255,255,0.06)', border: '2px solid var(--color-accent)', borderTop: 'none', borderRadius: '0 0 var(--radius) var(--radius)', overflow: 'hidden' }}>
                      {snapshot.presentChildren.map(name => (
                        <div key={name} style={{ padding: '8px 14px', borderBottom: '1px solid var(--color-border)', fontSize: '13px' }}>
                          {name}
                        </div>
                      ))}
                      <div style={{ padding: '8px 14px', fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                        דווח ע"י: {snapshot.reportedBy}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}
    </PageLayout>
  )
}
