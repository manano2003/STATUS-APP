import { useState } from 'react'
import { useStore } from '../data/store'
import Button from '../components/Button'
import PageLayout from '../components/PageLayout'

export default function AdminUsers() {
  const { users, roles, updateUserRoles, addRole, removeRole } = useStore()
  const [search, setSearch] = useState('')
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null)
  const [newRole, setNewRole] = useState('')

  const filtered = users.filter(u =>
    u.fullName.includes(search) || u.email.includes(search)
  )

  return (
    <PageLayout title="ניהול משתמשים" subtitle={`${users.length} משתמשים רשומים`}>

      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="חיפוש לפי שם מלא..."
        style={{
          width: '100%',
          maxWidth: '400px',
          padding: '12px 16px',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--color-border)',
          background: 'var(--color-bg-secondary)',
          color: 'var(--color-text)',
          fontSize: '16px',
          outline: 'none',
          marginBottom: '24px',
        }}
        onFocus={e => e.target.style.borderColor = 'var(--color-accent)'}
        onBlur={e => e.target.style.borderColor = 'rgba(77, 166, 232, 0.2)'}
      />

      {/* Role Management */}
      <div style={{
        background: 'var(--color-bg-card)',
        borderRadius: 'var(--radius)',
        border: '1px solid var(--color-border)',
        padding: '16px',
        marginBottom: '24px',
      }}>
        <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-accent)', marginBottom: '12px' }}>
          הרשאות קיימות
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
          {roles.map(role => (
            <span key={role} style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: '16px',
              fontSize: '13px',
              fontWeight: 600,
              background: role === 'ADMIN' ? 'rgba(232, 77, 77, 0.15)' : 'rgba(77, 166, 232, 0.15)',
              color: role === 'ADMIN' ? 'var(--color-danger)' : 'var(--color-accent)',
            }}>
              {role}
              {role !== 'USR' && role !== 'ADMIN' && (
                <button
                  onClick={() => removeRole(role)}
                  style={{
                    background: 'none', border: 'none', color: 'inherit',
                    cursor: 'pointer', fontSize: '16px', padding: '0', lineHeight: 1,
                  }}
                >
                  ×
                </button>
              )}
            </span>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            value={newRole}
            onChange={e => setNewRole(e.target.value)}
            placeholder="הרשאה חדשה..."
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border)',
              background: 'var(--color-bg-secondary)',
              color: 'var(--color-text)',
              fontSize: '14px',
              outline: 'none',
            }}
            onKeyDown={e => {
              if (e.key === 'Enter' && newRole.trim()) {
                addRole(newRole.trim())
                setNewRole('')
              }
            }}
          />
          <Button
            size="sm"
            disabled={!newRole.trim()}
            onClick={() => { addRole(newRole.trim()); setNewRole('') }}
            style={{ opacity: newRole.trim() ? 1 : 0.5 }}
          >
            הוסף
          </Button>
        </div>
      </div>

      {/* Users Table */}
      {filtered.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '48px', color: 'var(--color-text-secondary)',
          background: 'var(--color-bg-card)', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)',
        }}>
          {users.length === 0 ? 'אין משתמשים רשומים עדיין' : 'לא נמצאו תוצאות'}
        </div>
      ) : (
        <div style={{
          background: 'var(--color-bg-card)',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--color-border)',
          overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1.5fr 1fr 1.5fr',
            padding: '12px 16px',
            borderBottom: '1px solid var(--color-border)',
            fontSize: '13px',
            fontWeight: 700,
            color: 'var(--color-text-secondary)',
          }}>
            <span>שם מלא</span>
            <span>טלפון</span>
            <span>ישוב</span>
            <span>הרשאות</span>
          </div>

          {/* Rows */}
          {filtered.map(user => (
            <div key={user.id}>
              <div
                onClick={() => setExpandedUserId(expandedUserId === user.id ? null : user.id)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1.5fr 1fr 1.5fr',
                  padding: '12px 16px',
                  borderBottom: '1px solid var(--color-border)',
                  cursor: 'pointer',
                  fontSize: '14px',
                  transition: 'background 0.15s',
                  background: expandedUserId === user.id ? 'rgba(77, 166, 232, 0.05)' : 'transparent',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(77, 166, 232, 0.05)'}
                onMouseLeave={e => {
                  if (expandedUserId !== user.id) e.currentTarget.style.background = 'transparent'
                }}
              >
                <span style={{ fontWeight: 600 }}>{user.fullName}</span>
                <span style={{ direction: 'ltr', textAlign: 'right' }}>+972{user.phone}</span>
                <span>{user.city}</span>
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                  {user.roles.map(r => (
                    <span key={r} style={{
                      padding: '1px 8px',
                      borderRadius: '10px',
                      fontSize: '11px',
                      fontWeight: 600,
                      background: r === 'ADMIN' ? 'rgba(232, 77, 77, 0.15)' : 'rgba(77, 166, 232, 0.1)',
                      color: r === 'ADMIN' ? 'var(--color-danger)' : 'var(--color-accent)',
                    }}>
                      {r}
                    </span>
                  ))}
                </div>
              </div>

              {/* Expanded Details */}
              {expandedUserId === user.id && (
                <div style={{
                  padding: '16px 24px',
                  borderBottom: '1px solid var(--color-border)',
                  background: 'rgba(77, 166, 232, 0.03)',
                }}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    gap: '12px',
                    marginBottom: '16px',
                    fontSize: '13px',
                  }}>
                    <div>
                      <span style={{ color: 'var(--color-text-secondary)' }}>אימייל: </span>
                      <span dir="ltr">{user.email}</span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--color-text-secondary)' }}>רחוב: </span>
                      {user.street} {user.houseNumber}
                    </div>
                    <div>
                      <span style={{ color: 'var(--color-text-secondary)' }}>נפשות: </span>
                      {user.residents}
                    </div>
                  </div>

                  <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: '8px' , textAlign: 'center'}}>
                    שנה הרשאות:
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {roles.map(role => {
                      const hasRole = user.roles.includes(role)
                      return (
                        <button
                          key={role}
                          onClick={() => {
                            const newRoles = hasRole
                              ? user.roles.filter(r => r !== role)
                              : [...user.roles, role]
                            updateUserRoles(user.id, newRoles)
                          }}
                          disabled={role === 'USR'}
                          style={{
                            padding: '6px 14px',
                            borderRadius: '16px',
                            fontSize: '13px',
                            fontWeight: 600,
                            border: hasRole ? 'none' : '1px solid var(--color-border)',
                            background: hasRole
                              ? role === 'ADMIN' ? 'rgba(232, 77, 77, 0.2)' : 'rgba(77, 166, 232, 0.2)'
                              : 'transparent',
                            color: hasRole
                              ? role === 'ADMIN' ? 'var(--color-danger)' : 'var(--color-accent)'
                              : 'var(--color-text-secondary)',
                            cursor: role === 'USR' ? 'default' : 'pointer',
                            opacity: role === 'USR' ? 0.6 : 1,
                          }}
                        >
                          {hasRole ? '✓ ' : ''}{role}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </PageLayout>
  )
}
