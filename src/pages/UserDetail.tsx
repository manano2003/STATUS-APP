import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useStore } from '../data/store'
import { writeOrQueue } from '../data/outbox'
import { getShelterById } from '../data/shelters'
import PageLayout from '../components/PageLayout'

export default function UserDetail() {
  const { id } = useParams<{ id: string }>()
  const { users, checkins, checkinHistory, clearUserCheckinHistory, currentUser, updateUser } = useStore()
  const [resetMsg, setResetMsg] = useState('')
  const [editing, setEditing] = useState(false)

  const user = users.find(u => u.id === id)
  const checkin = checkins.find(c => c.userId === id)
  const isGuest = checkin?.isGuest
  const shelterName = checkin ? getShelterById(checkin.shelterId)?.name : null

  const displayName = user?.fullName ?? checkin?.userName ?? 'לא נמצא'
  const phone = user?.phone ?? checkin?.userPhone ?? ''
  const houseNumber = user?.houseNumber ?? checkin?.userHouseNumber ?? ''

  // Edit form state
  const [editName, setEditName] = useState(user?.fullName || '')
  const [editEmail, setEditEmail] = useState(user?.email || '')
  const [editPhone, setEditPhone] = useState(user?.phone || '')
  const [editCity, setEditCity] = useState(user?.city || '')
  const [editStreet, setEditStreet] = useState(user?.street || '')
  const [editHouse, setEditHouse] = useState(user?.houseNumber || '')
  const [editResidents, setEditResidents] = useState(user?.residents || 1)

  const isAdmin = currentUser?.roles.includes('ADMIN') || currentUser?.roles.includes('חמ"ל')

  const handleSave = () => {
    if (!user) return
    updateUser({
      ...user,
      fullName: editName.trim(),
      email: editEmail.trim(),
      phone: editPhone.trim(),
      city: editCity.trim(),
      street: editStreet.trim(),
      houseNumber: editHouse.trim(),
      residents: editResidents,
    })
    setEditing(false)
  }

  const userHistory = checkinHistory
    .filter(h => h.userId === id)
    .sort((a, b) => b.checkinTime - a.checkinTime)

  const formatDate = (ts: number) =>
    new Date(ts).toLocaleString('he-IL', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })

  const inputStyle = {
    width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--color-border)', background: 'var(--color-bg-secondary)',
    color: 'var(--color-text)', fontSize: '13px', outline: 'none',
  }

  const infoRows = [
    { label: 'שם מלא', value: displayName },
    ...(user ? [
      { label: 'אימייל', value: user.email || '—', dir: 'ltr' as const },
      { label: 'טלפון', value: phone ? `+972${phone}` : '—', dir: 'ltr' as const },
      { label: 'ישוב', value: user.city || '—' },
      { label: 'רחוב', value: user.street || '—' },
      { label: 'מספר בית', value: houseNumber || '—' },
      { label: 'נפשות בבית', value: String(user.residents) },
    ] : [
      { label: 'טלפון', value: phone ? `+972${phone}` : '—', dir: 'ltr' as const },
      { label: 'מספר בית', value: houseNumber || '—' },
    ]),
    ...(shelterName ? [{ label: 'מקלט נוכחי', value: shelterName }] : []),
    ...(checkin ? [{ label: 'נפשות במקלט', value: String(checkin.peopleCount) }] : []),
    ...(isGuest && checkin?.registeredBy ? [{ label: 'נרשם ע"י', value: checkin.registeredBy }] : []),
  ]

  return (
    <PageLayout title={displayName} backTo="/dashboard/users">

      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{
          width: '64px', height: '64px', borderRadius: '50%',
          background: 'rgba(77, 166, 232, 0.15)', border: '2px solid var(--color-accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '28px', fontWeight: 800, color: 'var(--color-accent)',
          margin: '0 auto 12px',
        }}>
          {displayName.charAt(0)}
        </div>
        {isGuest && (
          <span style={{
            fontSize: '11px', padding: '2px 10px', borderRadius: '10px',
            background: 'rgba(232, 197, 77, 0.15)', color: 'var(--color-warning)', fontWeight: 700,
          }}>אורח</span>
        )}
        {user && (
          <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', marginTop: '6px', flexWrap: 'wrap' }}>
            {user.roles.filter(r => r !== 'USR').map(r => (
              <span key={r} style={{
                padding: '1px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: 700,
                background: r === 'ADMIN' ? 'rgba(232, 77, 77, 0.15)' : 'rgba(77, 166, 232, 0.1)',
                color: r === 'ADMIN' ? 'var(--color-danger)' : 'var(--color-accent)',
              }}>{r}</span>
            ))}
          </div>
        )}
      </div>

      {/* Info Card - View Mode */}
      {!editing && (
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
                color: row.label === 'מקלט נוכחי' ? 'var(--color-accent)' : 'var(--color-text)',
              }}>
                {row.value}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Edit Mode */}
      {editing && user && (
        <div style={{
          background: 'var(--color-bg-card)',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--color-accent)',
          overflow: 'hidden',
          marginBottom: '20px',
          padding: '16px',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '4px', display: 'block' }}>שם מלא</label>
              <input value={editName} onChange={e => setEditName(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '4px', display: 'block' }}>אימייל</label>
              <input value={editEmail} onChange={e => setEditEmail(e.target.value)} dir="ltr" style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '4px', display: 'block' }}>טלפון</label>
              <input value={editPhone} onChange={e => setEditPhone(e.target.value.replace(/\D/g, ''))} dir="ltr" style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '4px', display: 'block' }}>ישוב</label>
              <input value={editCity} onChange={e => setEditCity(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '4px', display: 'block' }}>רחוב</label>
              <input value={editStreet} onChange={e => setEditStreet(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '4px', display: 'block' }}>מספר בית</label>
              <input value={editHouse} onChange={e => setEditHouse(e.target.value)} dir="ltr" style={{ ...inputStyle, maxWidth: '120px' }} />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '4px', display: 'block' }}>נפשות בבית</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button type="button" onClick={() => setEditResidents(Math.max(1, editResidents - 1))} style={{
                  width: '36px', height: '36px', borderRadius: '50%', border: '1px solid var(--color-border)',
                  background: 'var(--color-bg-secondary)', color: 'var(--color-text)', fontSize: '18px', cursor: 'pointer',
                }}>−</button>
                <span style={{ fontSize: '22px', fontWeight: 800, minWidth: '30px', textAlign: 'center' }}>{editResidents}</span>
                <button type="button" onClick={() => setEditResidents(editResidents + 1)} style={{
                  width: '36px', height: '36px', borderRadius: '50%', border: '1px solid var(--color-border)',
                  background: 'var(--color-bg-secondary)', color: 'var(--color-text)', fontSize: '18px', cursor: 'pointer',
                }}>+</button>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '16px' }}>
            <button onClick={handleSave} style={{
              background: 'var(--color-success)', color: '#fff', border: 'none',
              borderRadius: 'var(--radius-sm)', padding: '10px 28px', fontSize: '14px', fontWeight: 700, cursor: 'pointer',
            }}>שמור</button>
            <button onClick={() => setEditing(false)} style={{
              background: 'transparent', color: 'var(--color-text-secondary)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)', padding: '10px 28px', fontSize: '14px', fontWeight: 700, cursor: 'pointer',
            }}>ביטול</button>
          </div>
        </div>
      )}

      {/* Edit button - only for ADMIN/חמ"ל */}
      {isAdmin && user && !editing && (
        <button
          onClick={() => {
            setEditName(user.fullName)
            setEditEmail(user.email)
            setEditPhone(user.phone)
            setEditCity(user.city)
            setEditStreet(user.street)
            setEditHouse(user.houseNumber)
            setEditResidents(user.residents)
            setEditing(true)
          }}
          style={{
            display: 'block', width: '100%', padding: '14px', marginBottom: '20px',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--color-accent)',
            background: 'rgba(77, 166, 232, 0.08)',
            color: 'var(--color-accent)', fontSize: '14px', fontWeight: 700, cursor: 'pointer',
          }}
        >
          עריכת פרטים
        </button>
      )}

      {/* Contact Buttons */}
      {phone && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
          <a
            href={`tel:+972${phone}`}
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
            href={`https://wa.me/972${phone}`}
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

      {/* Checkin History */}
      <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-accent)', marginBottom: '8px' }}>
        היסטוריית ביקורים ({userHistory.length})
      </h3>
      <div style={{
        background: 'var(--color-bg-card)',
        borderRadius: 'var(--radius)',
        border: '1px solid var(--color-border)',
        overflow: 'hidden',
        marginBottom: '16px',
      }}>
        {userHistory.length === 0 ? (
          <p style={{ padding: '20px', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '13px' }}>
            אין היסטוריית ביקורים
          </p>
        ) : (
          <>
            <div style={{
              display: 'grid', gridTemplateColumns: '1.2fr 50px 80px',
              padding: '8px 12px', borderBottom: '1px solid var(--color-border)',
              fontSize: '10px', fontWeight: 700, color: 'var(--color-text-secondary)',
            }}>
              <span>מקלט</span>
              <span style={{ textAlign: 'center' }}>נפשות</span>
              <span style={{ textAlign: 'center' }}>תאריך</span>
            </div>
            {userHistory.map(h => {
              const shelter = getShelterById(h.shelterId)
              return (
                <div key={h.id} style={{
                  display: 'grid', gridTemplateColumns: '1.2fr 50px 80px',
                  padding: '10px 12px', borderBottom: '1px solid var(--color-border)',
                  fontSize: '12px',
                }}>
                  <span style={{ color: 'var(--color-accent)', fontWeight: 600 }}>
                    {shelter?.name ?? '—'}
                  </span>
                  <span style={{ textAlign: 'center', fontWeight: 700 }}>{h.peopleCount}</span>
                  <span style={{ textAlign: 'center', fontSize: '10px', color: 'var(--color-text-secondary)' }}>
                    {formatDate(h.checkinTime)}
                  </span>
                </div>
              )
            })}
          </>
        )}
      </div>

      {userHistory.length > 0 && id && (
        <button
          onClick={() => { if (confirm('האם למחוק את כל היסטוריית הביקורים?')) clearUserCheckinHistory(id) }}
          style={{
            display: 'block', width: '100%', padding: '14px',
            borderRadius: 'var(--radius)',
            border: '1px solid rgba(232, 77, 77, 0.3)',
            background: 'rgba(232, 77, 77, 0.08)',
            color: 'var(--color-danger)', fontSize: '14px', fontWeight: 700, cursor: 'pointer',
          }}
        >
          מחיקת היסטוריית ביקורים
        </button>
      )}

      {/* Reset PIN - only for ADMIN/חמ"ל */}
      {isAdmin && id && (
        <div style={{ marginTop: '16px' }}>
          <button
            onClick={async () => {
              if (!confirm('האם לאפס את הסיסמה? המשתמש יתבקש לבחור סיסמה חדשה בכניסה הבאה.')) return
              const data = await writeOrQueue('reset_pin', {
                caller_id: currentUser!.id,
                target_user_id: id,
              })
              if (data?.success) {
                setResetMsg('הסיסמה אופסה. המשתמש יתבקש לבחור סיסמה חדשה בכניסה הבאה.')
              } else {
                setResetMsg(data?.error === 'unauthorized' ? 'אין הרשאה' : 'שגיאה')
              }
            }}
            style={{
              display: 'block', width: '100%', padding: '14px',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--color-danger)',
              background: 'rgba(232, 77, 77, 0.08)',
              color: 'var(--color-danger)', fontSize: '14px', fontWeight: 700, cursor: 'pointer',
            }}
          >
            איפוס סיסמה
          </button>
          {resetMsg && (
            <p style={{ fontSize: '13px', color: resetMsg.includes('אופסה') ? 'var(--color-success)' : 'var(--color-danger)', textAlign: 'center', marginTop: '8px' }}>
              {resetMsg}
            </p>
          )}
        </div>
      )}
    </PageLayout>
  )
}
