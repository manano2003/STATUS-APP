import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { loadResidents, type Resident } from '../data/residents'
import { useStore, EMERGENCY_STATUS_LABELS, EMERGENCY_STATUS_COLORS, type EmergencyStatusType } from '../data/store'
import PageLayout from '../components/PageLayout'

const statuses: { type: EmergencyStatusType; icon: string }[] = [
  { type: 'located-healthy', icon: '✅' },
  { type: 'located-evacuated', icon: '🚑' },
  { type: 'missing', icon: '❓' },
  { type: 'harduf', icon: 'candle' },
]

export default function ResidentStatus() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { currentUser, getResidentStatus, setResidentStatus, removeResidentStatus } = useStore()
  const [residents, setResidents] = useState<Resident[]>([])

  useEffect(() => { loadResidents().then(setResidents) }, [])

  const resident = residents.find(r => r.id === id)
  if (!resident) return <div style={{ paddingTop: '100px', textAlign: 'center' }}>תושב לא נמצא</div>

  const currentStatus = getResidentStatus(resident.id)

  const handleSelect = (type: EmergencyStatusType) => {
    setResidentStatus({
      residentId: resident.id,
      status: type,
      updatedBy: currentUser?.fullName ?? 'מעדכן',
      updatedAt: Date.now(),
    })
  }

  return (
    <PageLayout title={resident.name} backTo="/emergency-status">

      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{
          width: '64px', height: '64px', borderRadius: '50%',
          background: currentStatus ? EMERGENCY_STATUS_COLORS[currentStatus.status] + '20' : 'rgba(77, 166, 232, 0.15)',
          border: '2px solid ' + (currentStatus ? EMERGENCY_STATUS_COLORS[currentStatus.status] : 'var(--color-accent)'),
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '28px', fontWeight: 800, color: 'var(--color-accent)',
          margin: '0 auto 12px',
        }}>
          {resident.name.charAt(0)}
        </div>
        {resident.phone && (
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px', direction: 'ltr', textAlign: 'center' }}>
            {resident.phone}
          </p>
        )}
        {currentStatus && (
          <p style={{
            fontSize: '14px', fontWeight: 700, marginTop: '8px', textAlign: 'center',
            color: EMERGENCY_STATUS_COLORS[currentStatus.status],
          }}>
            סטטוס נוכחי: {EMERGENCY_STATUS_LABELS[currentStatus.status]}
          </p>
        )}
      </div>

      <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '12px', textAlign: 'center' }}>
        בחר סטטוס
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {statuses.map(s => {
          const isActive = currentStatus?.status === s.type
          return (
            <button
              key={s.type}
              onClick={() => handleSelect(s.type)}
              style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                padding: '16px', borderRadius: 'var(--radius)',
                border: isActive ? '2px solid ' + EMERGENCY_STATUS_COLORS[s.type] : '1px solid var(--color-border)',
                background: isActive ? EMERGENCY_STATUS_COLORS[s.type] + '15' : 'var(--color-bg-card)',
                cursor: 'pointer', textAlign: 'right', color: 'var(--color-text)',
                transition: 'all 0.2s ease',
              }}
            >
              {s.icon === 'candle' ? (
                <img src="/STATUS-APP/candle.png" alt="הרדוף" style={{ width: '28px', height: '28px', objectFit: 'contain', filter: 'invert(1)' }} />
              ) : (
                <span style={{ fontSize: '24px' }}>{s.icon}</span>
              )}
              <span style={{
                fontSize: '16px', fontWeight: isActive ? 800 : 600,
                color: isActive ? EMERGENCY_STATUS_COLORS[s.type] : 'var(--color-text)',
                flex: 1,
              }}>
                {EMERGENCY_STATUS_LABELS[s.type]}
              </span>
              {isActive && (
                <span style={{
                  width: '24px', height: '24px', borderRadius: '50%',
                  background: EMERGENCY_STATUS_COLORS[s.type],
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ color: 'white', fontSize: '14px', fontWeight: 800 }}>✓</span>
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Reset button */}
      {currentStatus && (
        <button
          onClick={() => {
            removeResidentStatus(resident.id)
            navigate('/emergency-status')
          }}
          style={{
            display: 'block', width: '100%', marginTop: '20px', padding: '12px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--color-border)', background: 'var(--color-bg-card)',
            color: 'var(--color-text-secondary)', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
          }}
        >
          איפוס סטטוס אישי
        </button>
      )}
    </PageLayout>
  )
}
