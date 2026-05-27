import { useParams, useNavigate } from 'react-router-dom'
import { useStore } from '../data/store'
import { getDistressTypeInfo } from '../data/distressTypes'
import PageLayout from '../components/PageLayout'

export default function DistressAlertDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { distressAlerts, users, deleteDistressAlert } = useStore()

  const alert = distressAlerts.find(a => a.id === id)
  if (!alert) return <div style={{ paddingTop: '100px', textAlign: 'center' }}>קריאה לא נמצאה</div>

  const typeInfo = getDistressTypeInfo(alert.type)
  const user = users.find(u => u.id === alert.userId)

  const infoRows = [
    { label: 'שם', value: alert.userName },
    { label: 'טלפון', value: alert.userPhone ? `+972${alert.userPhone}` : '—', dir: 'ltr' as const },
    { label: 'מספר בית', value: alert.userHouseNumber || '—' },
    ...(user ? [
      { label: 'ישוב', value: user.city || '—' },
      { label: 'רחוב', value: user.street || '—' },
      { label: 'נפשות בבית', value: String(user.residents) },
    ] : []),
    { label: 'סוג אירוע', value: typeInfo.label },
    { label: 'שעה', value: new Date(alert.timestamp).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }) },
  ]

  return (
    <PageLayout title={alert.userName} backTo="/dashboard/distress">

      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{
          width: '64px', height: '64px', borderRadius: '50%',
          background: 'rgba(232, 77, 77, 0.15)', border: '2px solid var(--color-danger)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '28px', margin: '0 auto 12px',
        }}>
          🚨
        </div>
        <span style={{
          fontSize: '12px', padding: '3px 12px', borderRadius: '12px',
          background: 'rgba(232, 77, 77, 0.15)', color: 'var(--color-danger)', fontWeight: 700,
        }}>
          {typeInfo.label}
        </span>
      </div>

      <div style={{
        background: 'var(--color-bg-card)',
        borderRadius: 'var(--radius)',
        border: '1px solid var(--color-border)',
        overflow: 'hidden',
        marginBottom: '20px',
      }}>
        {infoRows.map((row, i) => (
          <div key={row.label} style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '12px 16px',
            borderBottom: i < infoRows.length - 1 ? '1px solid var(--color-border)' : 'none',
            fontSize: '13px',
          }}>
            <span style={{ color: 'var(--color-text-secondary)', fontWeight: 600 }}>{row.label}</span>
            <span style={{
              fontWeight: 600,
              direction: ('dir' in row && row.dir === 'ltr') ? 'ltr' : undefined,
              color: row.label === 'סוג אירוע' ? 'var(--color-danger)' : 'var(--color-text)',
            }}>
              {row.value}
            </span>
          </div>
        ))}
      </div>

      {alert.userPhone && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
          <a
            href={`tel:+972${alert.userPhone}`}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              padding: '14px', borderRadius: 'var(--radius)',
              background: 'rgba(77, 166, 232, 0.15)', border: '1px solid var(--color-accent)',
              color: 'var(--color-accent)', fontSize: '15px', fontWeight: 700, textDecoration: 'none',
            }}
          >
            <span style={{ fontSize: '20px' }}>📞</span>
            צלצול
          </a>
          <a
            href={`https://wa.me/972${alert.userPhone}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              padding: '14px', borderRadius: 'var(--radius)',
              background: 'rgba(77, 232, 138, 0.15)', border: '1px solid var(--color-success)',
              color: 'var(--color-success)', fontSize: '15px', fontWeight: 700, textDecoration: 'none',
            }}
          >
            <span style={{ fontSize: '20px' }}>💬</span>
            WhatsApp
          </a>
        </div>
      )}

      <button
        onClick={() => {
          if (confirm('האם למחוק קריאה זו?')) {
            deleteDistressAlert(alert.id)
            navigate('/dashboard/distress')
          }
        }}
        style={{
          display: 'block',
          width: '100%',
          padding: '14px',
          borderRadius: 'var(--radius)',
          border: '1px solid rgba(232, 77, 77, 0.3)',
          background: 'rgba(232, 77, 77, 0.08)',
          color: 'var(--color-danger)',
          fontSize: '14px',
          fontWeight: 700,
          cursor: 'pointer',
        }}
      >
        מחק קריאה
      </button>
    </PageLayout>
  )
}
