import { useState } from 'react'
import { useStore } from '../data/store'
import PageLayout from '../components/PageLayout'

export default function AdminManagement() {
  const { users, updateUserRoles, addUser, currentUser } = useStore()
  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')

  const isGuySkin = currentUser?.fullName === 'גיא סקין'
  const admins = users.filter(u => u.roles.includes('ADMIN'))

  const handleAdd = () => {
    if (!isGuySkin) {
      alert('רק גיא סקין יכול להוסיף אדמין ראשי')
      return
    }
    if (!newName.trim()) return

    // Check if user already exists by email
    const existing = newEmail.trim() ? users.find(u => u.email.toLowerCase() === newEmail.trim().toLowerCase()) : null
    if (existing) {
      if (!existing.roles.includes('ADMIN')) {
        updateUserRoles(existing.id, [...existing.roles, 'ADMIN'])
      }
    } else {
      addUser({
        id: Date.now().toString(),
        email: newEmail.trim(),
        fullName: newName.trim(),
        phone: '',
        city: '',
        street: '',
        houseNumber: '',
        residents: 1,
        roles: ['USR', 'ADMIN'],
      })
    }
    setNewName('')
    setNewEmail('')
  }

  const removeAdmin = (userId: string, currentRoles: string[]) => {
    if (!isGuySkin) {
      alert('רק גיא סקין יכול להסיר אדמין ראשי')
      return
    }
    updateUserRoles(userId, currentRoles.filter(r => r !== 'ADMIN'))
  }

  return (
    <PageLayout title="ניהול אדמינים ראשיים" subtitle={`${admins.length} אדמינים`} backTo="/communities">

      {/* Current admins */}
      <div style={{
        background: 'var(--color-bg-card)',
        borderRadius: 'var(--radius)',
        border: '1px solid var(--color-border)',
        overflow: 'hidden',
        marginBottom: '20px',
      }}>
        {admins.length === 0 ? (
          <p style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '13px' }}>
            אין אדמינים ראשיים
          </p>
        ) : (
          admins.map(user => (
            <div
              key={user.id}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '12px 14px', borderBottom: '1px solid var(--color-border)',
              }}
            >
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%',
                background: 'rgba(232, 77, 77, 0.15)', border: '2px solid var(--color-danger)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '16px', fontWeight: 800, color: 'var(--color-danger)', flexShrink: 0,
              }}>
                {user.fullName.charAt(0)}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '14px', fontWeight: 700, margin: 0, color: 'var(--color-text)' }}>
                  {user.fullName}
                </p>
                <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', margin: '2px 0 0' }}>
                  {user.email || '—'}
                </p>
              </div>
              {isGuySkin && (
                <button
                  onClick={() => removeAdmin(user.id, user.roles)}
                  style={{
                    background: 'none', border: 'none', color: 'var(--color-danger)',
                    fontSize: '16px', cursor: 'pointer', padding: '0 4px',
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add admin */}
      {isGuySkin && (
        <div style={{
          background: 'var(--color-bg-card)',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--color-border)',
          padding: '16px',
        }}>
          <p style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px', textAlign: 'center' }}>
            הוספת אדמין ראשי
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="שם מלא"
              style={{
                width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)', background: 'var(--color-bg-secondary)',
                color: 'var(--color-text)', fontSize: '14px', outline: 'none',
              }}
            />
            <input
              type="email"
              value={newEmail}
              onChange={e => setNewEmail(e.target.value)}
              placeholder="אימייל"
              dir="ltr"
              style={{
                width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)', background: 'var(--color-bg-secondary)',
                color: 'var(--color-text)', fontSize: '14px', outline: 'none',
              }}
            />
            <button
              onClick={handleAdd}
              style={{
                background: 'var(--color-danger)', color: '#fff', border: 'none',
                borderRadius: 'var(--radius-sm)', padding: '12px', fontSize: '14px',
                fontWeight: 700, cursor: 'pointer',
              }}
            >
              הוסף אדמין ראשי
            </button>
          </div>
        </div>
      )}

      {!isGuySkin && (
        <p style={{ textAlign: 'center', color: 'var(--color-danger)', fontSize: '13px', marginTop: '16px' }}>
          רק גיא סקין יכול לנהל אדמינים ראשיים
        </p>
      )}
    </PageLayout>
  )
}
