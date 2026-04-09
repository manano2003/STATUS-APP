import { useParams } from 'react-router-dom'
import { getDistressTypeInfo } from '../data/distressTypes'
import { useStore, type DistressType } from '../data/store'
import BackButton from '../components/BackButton'

export default function HistoryDistressDay() {
  const { type, date } = useParams<{ type: string; date: string }>()
  const { distressHistory } = useStore()

  const typeInfo = type ? getDistressTypeInfo(type as DistressType) : undefined
  if (!typeInfo) return <div style={{ paddingTop: '100px', textAlign: 'center' }}>סוג אירוע לא נמצא</div>

  const entries = distressHistory.filter(e => {
    if (e.type !== typeInfo.id) return false
    const d = new Date(e.deletedAt).toISOString().split('T')[0]
    return d === date
  })

  const formatDate = (d: string) => { const p = d.split('-'); return `${p[2]}/${p[1]}/${p[0]}` }
  const formatTime = (ts: number) => new Date(ts).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })

  return (
    <div style={{ paddingTop: '68px', padding: '68px 16px 100px', maxWidth: '500px', margin: '0 auto' }}>
      <BackButton to={`/dashboard/history/distress/${typeInfo.id}`} />

      <h1 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '4px', textAlign: 'center' }}>{typeInfo.label}</h1>
      <p style={{ color: 'var(--color-danger)', fontSize: '16px', fontWeight: 700, marginBottom: '4px', textAlign: 'center' }}>
        {date ? formatDate(date) : ''}
      </p>
      <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px', marginBottom: '16px', textAlign: 'center' }}>
        {entries.length} קריאות
      </p>

      <div style={{
        background: 'var(--color-bg-card)', borderRadius: 'var(--radius)',
        border: '1px solid var(--color-border)', overflow: 'hidden',
      }}>
        {entries.length === 0 ? (
          <p style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '13px' }}>
            לא היו קריאות ביום זה
          </p>
        ) : (
          <>
            <div style={{
              display: 'grid', gridTemplateColumns: '1.3fr 1fr 60px 60px',
              padding: '10px 14px', borderBottom: '1px solid var(--color-border)',
              fontSize: '11px', fontWeight: 700, color: 'var(--color-text-secondary)',
            }}>
              <span>שם</span><span>טלפון</span><span style={{ textAlign: 'center' }}>בית</span><span style={{ textAlign: 'center' }}>שעה</span>
            </div>
            {entries.map(e => (
              <div key={e.id} style={{
                display: 'grid', gridTemplateColumns: '1.3fr 1fr 60px 60px',
                padding: '10px 14px', borderBottom: '1px solid var(--color-border)', fontSize: '12px',
              }}>
                <span style={{ fontWeight: 600 }}>{e.userName}</span>
                <span style={{ direction: 'ltr', textAlign: 'right', fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                  {e.userPhone ? `+972${e.userPhone}` : '—'}
                </span>
                <span style={{ textAlign: 'center' }}>{e.userHouseNumber || '—'}</span>
                <span style={{ textAlign: 'center', fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                  {formatTime(e.timestamp)}
                </span>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
