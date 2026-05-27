import { useState } from 'react'
import { useStore, EMERGENCY_STATUS_COLORS } from '../data/store'
import PageLayout from '../components/PageLayout'

export default function HistoryEmergency() {
  const { emergencyHistory } = useStore()
  const [search, setSearch] = useState('')

  const formatDay = (ts: number) =>
    new Date(ts).toLocaleDateString('he-IL', { weekday: 'long', day: '2-digit', month: '2-digit', year: '2-digit' })

  const filtered = search.trim()
    ? emergencyHistory.filter(e =>
        e.residentName.includes(search) || e.statusValue.includes(search) || e.updatedBy.includes(search))
    : emergencyHistory

  // Group by date
  const grouped: Record<string, typeof filtered> = {}
  filtered.forEach(entry => {
    const day = new Date(entry.createdAt).toISOString().split('T')[0]
    if (!grouped[day]) grouped[day] = []
    grouped[day].push(entry)
  })

  const sortedDays = Object.keys(grouped).sort((a, b) => b.localeCompare(a))

  const getStatusColor = (statusValue: string): string => {
    const colorMap: Record<string, string> = {
      'מאותר-בריא': EMERGENCY_STATUS_COLORS['located-healthy'],
      'מאותר-מפונה': EMERGENCY_STATUS_COLORS['located-evacuated'],
      'נעדר': EMERGENCY_STATUS_COLORS['missing'],
      'הרדוף': EMERGENCY_STATUS_COLORS['harduf'],
    }
    return colorMap[statusValue] || 'var(--color-text-secondary)'
  }

  return (
    <PageLayout title="עדכון תושבים — היסטוריה" subtitle={`סה"כ ${emergencyHistory.length} עדכונים`} backTo="/dashboard/history">

      {/* Search */}
      <div style={{ marginBottom: '16px' }}>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="חיפוש לפי שם תושב, סטאטוס או מעדכן..."
          style={{
            width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--color-border)', background: 'var(--color-bg-secondary)',
            color: 'var(--color-text)', fontSize: '14px', outline: 'none',
            boxSizing: 'border-box',
          }}
          onFocus={e => e.target.style.borderColor = 'var(--color-accent)'}
          onBlur={e => e.target.style.borderColor = 'rgba(77, 166, 232, 0.2)'}
        />
      </div>

      {sortedDays.length === 0 ? (
        <div style={{
          background: 'var(--color-bg-card)', borderRadius: 'var(--radius)',
          border: '1px solid var(--color-border)', padding: '32px', textAlign: 'center',
        }}>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px' }}>
            {search ? 'לא נמצאו תוצאות' : 'אין היסטוריה עדיין'}
          </p>
        </div>
      ) : (
        sortedDays.map(day => (
          <div key={day} style={{ marginBottom: '16px' }}>
            <h3 style={{
              fontSize: '14px', fontWeight: 800, color: 'var(--color-accent)',
              marginBottom: '8px', textAlign: 'center',
            }}>
              {formatDay(grouped[day][0].createdAt)}
            </h3>
            <div style={{
              background: 'var(--color-bg-card)', borderRadius: 'var(--radius)',
              border: '1px solid var(--color-border)', overflow: 'hidden',
            }}>
              <div style={{
                display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 80px',
                padding: '8px 12px', borderBottom: '1px solid var(--color-border)',
                fontSize: '10px', fontWeight: 700, color: 'var(--color-text-secondary)',
              }}>
                <span>תושב</span>
                <span>סטאטוס</span>
                <span>עודכן ע"י</span>
                <span style={{ textAlign: 'center' }}>שעה</span>
              </div>
              {grouped[day].map(entry => (
                <div key={entry.id} style={{
                  display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 80px',
                  padding: '10px 12px', borderBottom: '1px solid var(--color-border)',
                  fontSize: '12px',
                }}>
                  <span style={{ fontWeight: 600 }}>{entry.residentName}</span>
                  <span style={{ color: getStatusColor(entry.statusValue), fontWeight: 700 }}>
                    {entry.statusValue}
                  </span>
                  <span style={{ color: 'var(--color-text-secondary)', fontSize: '11px' }}>
                    {entry.updatedBy}
                  </span>
                  <span style={{ textAlign: 'center', fontSize: '10px', color: 'var(--color-text-secondary)' }}>
                    {new Date(entry.createdAt).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </PageLayout>
  )
}
