import { useState } from 'react'
import { getRegularShelters, getSpecialStatuses } from '../data/shelters'
import { useStore } from '../data/store'
import PageLayout from '../components/PageLayout'

const MONTHS_HE = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר']
const DAYS_HE = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳']

export default function HistoryShelters() {
  const { shelterHistory } = useStore()
  const allShelters = [...getRegularShelters(), ...getSpecialStatuses()]

  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [selectedAlarm, setSelectedAlarm] = useState<number | null>(null)
  const [expandedShelter, setExpandedShelter] = useState<string | null>(null)

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDayOfWeek = new Date(year, month, 1).getDay()

  const daysWithData = new Set(
    shelterHistory
      .filter(s => { const d = new Date(s.date); return d.getFullYear() === year && d.getMonth() === month })
      .map(s => new Date(s.date).getDate())
  )

  // Get unique alarms (timestamps) for a specific day
  const getAlarmsForDay = (dateStr: string) => {
    const daySnapshots = shelterHistory.filter(s => s.date === dateStr)
    const timestamps = [...new Set(daySnapshots.map(s => s.timestamp))].sort((a, b) => a - b)
    return timestamps
  }

  // Get snapshots for a specific alarm
  const getSnapshotsForAlarm = (dateStr: string, timestamp: number) => {
    return shelterHistory.filter(s => s.date === dateStr && s.timestamp === timestamp)
  }

  const formatTime = (ts: number) => new Date(ts).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })

  return (
    <PageLayout title="🏛️ היסטוריית נוכחות במקלטים" backTo="/dashboard/history">

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
            <button key={day} onClick={() => {
              if (hasData) {
                setSelectedDay(isSelected ? null : dateStr)
                setSelectedAlarm(null)
                setExpandedShelter(null)
              }
            }}
              style={{ width: '36px', height: '44px', borderRadius: '8px', border: isSelected ? '2px solid var(--color-accent)' : 'none', background: isSelected ? 'rgba(77, 166, 232, 0.15)' : 'transparent', color: hasData ? 'var(--color-text)' : 'var(--color-text-secondary)', fontWeight: hasData ? 800 : 400, fontSize: '13px', cursor: hasData ? 'pointer' : 'default', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
              <span>{day}</span>
              {hasData && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-success)', marginTop: '2px' }} />}
            </button>
          )
        })}
      </div>

      {/* Day selected - show alarms or shelters */}
      {selectedDay && (() => {
        const alarms = getAlarmsForDay(selectedDay)
        const formattedDate = new Date(selectedDay + 'T00:00:00').toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

        // If only 1 alarm, skip selection and show shelters directly
        if (alarms.length === 1 && selectedAlarm === null) {
          // Auto-select single alarm
          setTimeout(() => setSelectedAlarm(alarms[0]), 0)
        }

        return (
          <>
            <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-accent)', textAlign: 'center', marginBottom: '12px' }}>
              {formattedDate}
            </p>

            {/* Alarm selection - only if more than 1 alarm */}
            {alarms.length > 1 && selectedAlarm === null && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', textAlign: 'center', marginBottom: '4px' }}>
                  {alarms.length} אזעקות ביום זה — בחר אזעקה
                </p>
                {alarms.map((ts, i) => {
                  const snapshots = getSnapshotsForAlarm(selectedDay, ts)
                  const totalPeople = snapshots.reduce((sum, s) => s.checkins.reduce((s2, c) => s2 + c.peopleCount, 0) + sum, 0)
                  return (
                    <button key={ts} onClick={() => { setSelectedAlarm(ts); setExpandedShelter(null) }} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '14px', background: 'var(--color-bg-card)',
                      border: '1px solid var(--color-border)', borderRadius: 'var(--radius)',
                      cursor: 'pointer', color: 'var(--color-text)',
                    }}>
                      <span style={{ fontSize: '15px', fontWeight: 700 }}>🚨 אזעקה {i + 1} — {formatTime(ts)}</span>
                      <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--color-accent)' }}>{totalPeople} נפשות</span>
                    </button>
                  )
                })}
              </div>
            )}

            {/* Shelter list for selected alarm */}
            {selectedAlarm !== null && (() => {
              const snapshots = getSnapshotsForAlarm(selectedDay, selectedAlarm)
              const totalPeople = snapshots.reduce((sum, s) => s.checkins.reduce((s2, c) => s2 + c.peopleCount, 0) + sum, 0)
              const alarms = getAlarmsForDay(selectedDay)

              return (
                <>
                  {alarms.length > 1 && (
                    <button onClick={() => { setSelectedAlarm(null); setExpandedShelter(null) }} style={{
                      display: 'block', margin: '0 auto 12px', padding: '6px 16px',
                      background: 'rgba(77, 166, 232, 0.15)', border: '1px solid var(--color-accent)',
                      borderRadius: 'var(--radius-sm)', color: 'var(--color-accent)',
                      fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                    }}>חזרה לבחירת אזעקה</button>
                  )}

                  <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', textAlign: 'center', marginBottom: '12px' }}>
                    {formatTime(selectedAlarm)} — {totalPeople} נפשות
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {allShelters.map(shelter => {
                      const snapshot = snapshots.find(s => s.shelterId === shelter.id)
                      if (!snapshot || snapshot.checkins.length === 0) return null
                      const isExpanded = expandedShelter === shelter.id
                      const shelterPeople = snapshot.checkins.reduce((sum, c) => sum + c.peopleCount, 0)
                      return (
                        <div key={shelter.id}>
                          <button onClick={() => setExpandedShelter(isExpanded ? null : shelter.id)} style={{
                            display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
                            padding: '14px', background: 'var(--color-bg-card)',
                            border: `1px solid ${isExpanded ? 'var(--color-accent)' : 'var(--color-border)'}`, borderRadius: 'var(--radius)',
                            cursor: 'pointer', textAlign: 'right', color: 'var(--color-text)',
                          }}>
                            <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', minWidth: '20px' }}>{shelter.number}</span>
                            <span style={{ fontSize: '14px', fontWeight: 700, flex: 1 }}>{shelter.name}</span>
                            <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--color-success)' }}>{shelterPeople} נפשות</span>
                          </button>
                          {isExpanded && (
                            <div style={{ background: 'rgba(255,255,255,0.06)', border: '2px solid var(--color-accent)', borderTop: 'none', borderRadius: '0 0 var(--radius) var(--radius)', overflow: 'hidden' }}>
                              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 55px 55px', padding: '8px 14px', borderBottom: '1px solid var(--color-border)', fontSize: '11px', fontWeight: 700, color: 'var(--color-text-secondary)' }}>
                                <span>שם</span><span>טלפון</span><span style={{ textAlign: 'center' }}>בית</span><span style={{ textAlign: 'center' }}>נפשות</span>
                              </div>
                              {snapshot.checkins.map((c, i) => (
                                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 55px 55px', padding: '8px 14px', borderBottom: '1px solid var(--color-border)', fontSize: '12px' }}>
                                  <span style={{ fontWeight: 600 }}>
                                    {c.userName}
                                    {c.isGuest && <span style={{ marginRight: '4px', fontSize: '9px', padding: '0 4px', borderRadius: '6px', background: 'rgba(232, 197, 77, 0.15)', color: 'var(--color-warning)' }}>אורח</span>}
                                  </span>
                                  <span style={{ direction: 'ltr', textAlign: 'right', fontSize: '11px', color: 'var(--color-text-secondary)' }}>{c.userPhone || '—'}</span>
                                  <span style={{ textAlign: 'center' }}>{c.userHouseNumber || '—'}</span>
                                  <span style={{ textAlign: 'center', fontWeight: 700 }}>{c.peopleCount}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </>
              )
            })()}
          </>
        )
      })()}
    </PageLayout>
  )
}
