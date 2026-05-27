import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useStore } from '../data/store'
import { supabase } from '../data/supabase'
import { loadSchoolUsersFromDB, saveSchoolUsersToDB, getSchoolUsersFromCache } from '../data/sourceData'
import SchoolHome from './SchoolHome'

const PERMISSION_TYPES = [
  { id: 'מנהלת', label: 'מנהלת', color: 'var(--color-danger)', icon: '👩‍💼' },
  { id: 'מזכירות', label: 'מזכירות', color: 'var(--color-warning)', icon: '📝' },
  { id: 'סגל חינוכי', label: 'סגל חינוכי', color: 'var(--color-accent)', icon: '👩‍🏫' },
]

interface SchoolUser {
  id: string
  fullName: string
  phone: string
  email: string
  className: string
  roles?: string[]
}

export default function SchoolPermissions() {
  const { schoolId } = useParams<{ schoolId: string }>()
  const { currentUser } = useStore()
  const [users, setUsers] = useState<SchoolUser[]>(() => getSchoolUsersFromCache(schoolId || ''))

  useEffect(() => {
    if (!schoolId) return
    loadSchoolUsersFromDB(schoolId).then(u => setUsers(u as SchoolUser[]))
    const channel = supabase.channel(`perms-${schoolId}`)
      .on('postgres_changes', { event: '*', schema: 'status', table: 'school_users', filter: `school_id=eq.${schoolId}` }, () => {
        loadSchoolUsersFromDB(schoolId).then(u => setUsers(u as SchoolUser[]))
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [schoolId])
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const getCount = (roleId: string) => users.filter(u => u.roles?.includes(roleId)).length

  const toggleRole = (userId: string, roleId: string) => {
    const updated = users.map(u => {
      if (u.id !== userId) return u
      const roles = u.roles || []
      if (roles.includes(roleId)) {
        return { ...u, roles: roles.filter(r => r !== roleId) }
      } else {
        return { ...u, roles: [...roles, roleId] }
      }
    })
    setUsers(updated)
    saveSchoolUsersToDB(schoolId || '', updated, currentUser?.id || '')
  }

  const filtered = selectedRole ? users.filter(u => {
    if (!search.trim()) return true
    return u.fullName.toLowerCase().includes(search.trim().toLowerCase())
  }) : []

  return (
    <SchoolHome backTo={`/schools/${schoolId}/sources/users`} content={
      <>
        {!selectedRole ? (
          <>
            {/* Permission rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
              {PERMISSION_TYPES.map(perm => {
                const count = getCount(perm.id)
                return (
                  <button
                    key={perm.id}
                    onClick={() => setSelectedRole(perm.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '14px',
                      padding: '16px', background: 'var(--color-bg-card)',
                      border: '1px solid var(--color-border)', borderRadius: 'var(--radius)',
                      cursor: 'pointer', textAlign: 'right', color: 'var(--color-text)',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = perm.color}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(77, 166, 232, 0.2)'}
                  >
                    <span style={{ fontSize: '28px', width: '40px', textAlign: 'center', flexShrink: 0 }}>{perm.icon}</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '15px', fontWeight: 700, margin: 0, textAlign: 'right' }}>{perm.label}</p>
                      <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '2px 0 0', textAlign: 'right' }}>
                        {count} משתמשים
                      </p>
                    </div>
                    <span style={{ fontSize: '20px', fontWeight: 800, color: perm.color, width: '40px', textAlign: 'center', flexShrink: 0 }}>
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Legend */}
            <div style={{
              background: 'var(--color-bg-card)',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--color-border)',
              overflow: 'hidden',
            }}>
              <div style={{
                padding: '14px 16px',
                borderBottom: '1px solid var(--color-border)',
                fontSize: '16px', fontWeight: 800, color: 'var(--color-accent)', textAlign: 'center',
              }}>
                מפתח הרשאות
              </div>
              {[
                { icon: '👩‍💼', label: 'מנהלת', color: 'var(--color-danger)', desc: 'גישה מלאה לניהול בית הספר — טבלאות מקור, היסטוריה, גיבוי, הרשאות וצפייה בכל הכיתות.' },
                { icon: '📝', label: 'מזכירות', color: 'var(--color-warning)', desc: 'גישה כמו מנהלת — טבלאות מקור, היסטוריה, גיבוי וצפייה בכל הכיתות.' },
                { icon: '👩‍🏫', label: 'סגל חינוכי', color: 'var(--color-accent)', desc: 'גישה לטאב הכיתות — צפייה ודיווח נוכחות בכיתה המשויכת בלבד.' },
              ].map(item => (
                <div key={item.label} style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid var(--color-border)',
                  display: 'flex', gap: '12px', alignItems: 'flex-start',
                }}>
                  <span style={{ fontSize: '20px', flexShrink: 0 }}>{item.icon}</span>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 4px', color: item.color }}>{item.label}</p>
                    <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.5 }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            {/* Role detail - user list */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: PERMISSION_TYPES.find(p => p.id === selectedRole)?.color, margin: 0 }}>
                {selectedRole} ({getCount(selectedRole)})
              </h3>
              <button onClick={() => { setSelectedRole(null); setSearch('') }} style={{
                background: getCount(selectedRole) > 0 ? 'rgba(77, 166, 232, 0.15)' : 'transparent',
                border: `1px solid ${getCount(selectedRole) > 0 ? 'var(--color-accent)' : 'var(--color-border)'}`,
                borderRadius: 'var(--radius-sm)',
                color: getCount(selectedRole) > 0 ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                cursor: 'pointer', fontSize: '13px', fontWeight: 700, padding: '8px 16px',
              }}>חזרה להרשאות</button>
            </div>

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

            {selectedRole === 'סגל חינוכי' && (
              <button
                onClick={() => {
                  const allSelected = users.every(u => u.roles?.includes('סגל חינוכי'))
                  const updated = users.map(u => {
                    const roles = u.roles || []
                    if (allSelected) {
                      return { ...u, roles: roles.filter(r => r !== 'סגל חינוכי') }
                    } else {
                      return { ...u, roles: roles.includes('סגל חינוכי') ? roles : [...roles, 'סגל חינוכי'] }
                    }
                  })
                  setUsers(updated)
                  saveSchoolUsersToDB(schoolId || '', updated, currentUser?.id || '')
                }}
                style={{
                  display: 'block', width: '100%', marginBottom: '12px', padding: '10px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-accent)',
                  background: users.every(u => u.roles?.includes('סגל חינוכי')) ? 'rgba(77, 166, 232, 0.15)' : 'transparent',
                  color: 'var(--color-accent)', fontSize: '13px', fontWeight: 700, cursor: 'pointer', textAlign: 'center',
                }}
              >
                {users.every(u => u.roles?.includes('סגל חינוכי')) ? 'הסר סימון מכולם' : 'סמן את כולם'}
              </button>
            )}

            <div style={{
              background: 'var(--color-bg-card)',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--color-border)',
              overflow: 'hidden',
            }}>
              {filtered.length === 0 && users.length === 0 ? (
                <p style={{ padding: '20px', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '13px' }}>
                  אין משתמשים - העלה קודם אקסל בטבלאות מקור
                </p>
              ) : filtered.length === 0 ? (
                <p style={{ padding: '20px', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '13px' }}>
                  אין תוצאות
                </p>
              ) : (
                filtered.map(user => {
                  const hasRole = user.roles?.includes(selectedRole) || false
                  return (
                    <div
                      key={user.id}
                      onClick={() => toggleRole(user.id, selectedRole)}
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
                        background: hasRole ? (PERMISSION_TYPES.find(p => p.id === selectedRole)?.color || 'var(--color-accent)') : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0, transition: 'all 0.2s',
                      }}>
                        {hasRole && <span style={{ color: '#fff', fontSize: '14px', fontWeight: 800 }}>✓</span>}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '14px', fontWeight: 600, margin: 0, color: hasRole ? (PERMISSION_TYPES.find(p => p.id === selectedRole)?.color || 'var(--color-accent)') : 'var(--color-text)' }}>
                          {user.fullName}
                        </p>
                        <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', margin: '2px 0 0' }}>
                          {user.className ? `כיתה ${user.className}` : ''} {user.phone ? `| ${user.phone}` : ''}
                        </p>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </>
        )}
      </>
    } />
  )
}
