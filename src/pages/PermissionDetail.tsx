import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useStore } from '../data/store'
import PageLayout from '../components/PageLayout'

const PERMISSION_LABELS: Record<string, string> = {
  'ADMIN': 'אדמין ראשי',
  'חמ"ל': 'חמ"ל',
  'גננת': 'גנים',
  'מועדונים': 'מועדונים',
  'מנהל מקלט': 'מנהל מקלט',
}

export default function PermissionDetail() {
  const { role } = useParams<{ role: string }>()
  const decodedRole = decodeURIComponent(role || '')
  const { users, updateUserRoles, currentUser } = useStore()
  const [search, setSearch] = useState('')

  const label = PERMISSION_LABELS[decodedRole] || decodedRole

  const filteredUsers = users.filter(u => {
    if (!search.trim()) return true
    return u.fullName.toLowerCase().includes(search.trim().toLowerCase())
  })

  const isGuySkin = currentUser?.fullName === 'גיא סקין'

  const toggleRole = (userId: string, currentRoles: string[]) => {
    if (decodedRole === 'ADMIN' && !isGuySkin) {
      alert('רק גיא סקין יכול לתת או להסיר הרשאת אדמין ראשי')
      return
    }
    if (currentRoles.includes(decodedRole)) {
      updateUserRoles(userId, currentRoles.filter(r => r !== decodedRole))
    } else {
      updateUserRoles(userId, [...currentRoles, decodedRole])
    }
  }

  const assignedCount = users.filter(u => u.roles.includes(decodedRole)).length

  return (
    <PageLayout title={`${label}`} subtitle={`${assignedCount} משתמשים עם הרשאה זו`} backTo="/dashboard/permissions">

      <input
        type="text"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="חיפוש לפי שם..."
        style={{
          width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--color-border)', background: 'var(--color-bg-secondary)',
          color: 'var(--color-text)', fontSize: '14px', marginBottom: '12px', outline: 'none',
        }}
      />

      <div style={{
        background: 'var(--color-bg-card)',
        borderRadius: 'var(--radius)',
        border: '1px solid var(--color-border)',
        overflow: 'hidden',
      }}>
        {filteredUsers.length === 0 ? (
          <p style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '13px' }}>
            אין משתמשים
          </p>
        ) : (
          filteredUsers.map(user => {
            const hasRole = user.roles.includes(decodedRole)
            return (
              <div
                key={user.id}
                onClick={() => toggleRole(user.id, user.roles)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '12px 14px', borderBottom: '1px solid var(--color-border)',
                  cursor: 'pointer', transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(77, 166, 232, 0.05)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{
                  width: '24px', height: '24px', borderRadius: '6px',
                  border: hasRole ? 'none' : '2px solid var(--color-border)',
                  background: hasRole ? 'var(--color-accent)' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, transition: 'all 0.2s',
                }}>
                  {hasRole && <span style={{ color: '#fff', fontSize: '14px', fontWeight: 800 }}>✓</span>}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '14px', fontWeight: 600, margin: 0, color: hasRole ? 'var(--color-accent)' : 'var(--color-text)' }}>
                    {user.fullName}
                  </p>
                  <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', margin: '2px 0 0' }}>
                    {user.phone ? `+972${user.phone}` : ''} {user.houseNumber ? `| בית ${user.houseNumber}` : ''}
                  </p>
                </div>
              </div>
            )
          })
        )}
      </div>
    </PageLayout>
  )
}
