import { useState } from 'react'
import { useParams } from 'react-router-dom'
import PageLayout from '../components/PageLayout'

interface CouncilUser {
  id: string
  fullName: string
  phone: string
  email: string
  registeredAt: string
}

const STORAGE_KEY_PREFIX = 'council_users_'

function loadCouncilUsers(councilId: string): CouncilUser[] {
  try { return JSON.parse(localStorage.getItem(`${STORAGE_KEY_PREFIX}${councilId}`) || '[]') } catch { return [] }
}

function saveCouncilUsers(councilId: string, users: CouncilUser[]) {
  localStorage.setItem(`${STORAGE_KEY_PREFIX}${councilId}`, JSON.stringify(users))
}

interface School {
  id: string
  name: string
  councilId: string
}

function loadSchools(): School[] {
  try {
    const saved = localStorage.getItem('status_schools')
    if (saved) return JSON.parse(saved)
  } catch {}
  return [{ id: 'hartuv', name: 'הרטוב', councilId: 'mateh-yehuda' }]
}

const councilNames: Record<string, string> = {
  'mateh-yehuda': 'מטה יהודה',
}

export default function CouncilPermissions() {
  const { councilId } = useParams<{ councilId: string }>()
  const [users, setUsers] = useState<CouncilUser[]>(() => loadCouncilUsers(councilId || ''))
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const councilName = councilId ? councilNames[councilId] || councilId : ''
  const schools = loadSchools().filter(s => s.councilId === councilId)

  const addUser = () => {
    if (!newName.trim() || !councilId) return
    const user: CouncilUser = {
      id: Date.now().toString(),
      fullName: newName.trim(),
      phone: newPhone.trim(),
      email: newEmail.trim(),
      registeredAt: new Date().toISOString(),
    }
    const updated = [...users, user]
    setUsers(updated)
    saveCouncilUsers(councilId, updated)
    setNewName('')
    setNewPhone('')
    setNewEmail('')
    setShowAdd(false)
  }

  const deleteUser = (userId: string) => {
    if (!councilId) return
    const updated = users.filter(u => u.id !== userId)
    setUsers(updated)
    saveCouncilUsers(councilId, updated)
    setDeleteConfirm(null)
  }

  return (
    <PageLayout title="הרשאות מועצה" subtitle={councilName} backTo={`/schools/council/${councilId}`}>
      {/* Info box */}
      <div style={{
        background: 'rgba(77, 166, 232, 0.08)',
        border: '1px solid rgba(77, 166, 232, 0.3)',
        borderRadius: 'var(--radius)',
        padding: '14px 16px',
        marginBottom: '20px',
        fontSize: '13px',
        color: 'var(--color-text-secondary)',
        lineHeight: 1.6,
        textAlign: 'right',
      }}>
        משתמשים ברשימה זו יכולים לצפות בכל בתי הספר של מועצת <strong style={{ color: 'var(--color-accent)' }}>{councilName}</strong> ולגשת לטאב המזכירות בכל בית ספר.
      </div>

      {/* Schools in this council */}
      <div style={{
        background: 'var(--color-bg-card)',
        borderRadius: 'var(--radius)',
        border: '1px solid var(--color-border)',
        overflow: 'hidden',
        marginBottom: '20px',
      }}>
        <div style={{
          padding: '12px 16px',
          borderBottom: '1px solid var(--color-border)',
          fontSize: '14px', fontWeight: 800, color: 'var(--color-accent)', textAlign: 'center',
        }}>
          בתי ספר במועצה ({schools.length})
        </div>
        {schools.length === 0 ? (
          <p style={{ padding: '16px', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '13px' }}>
            אין בתי ספר
          </p>
        ) : (
          schools.map(school => (
            <div key={school.id} style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 14px', borderBottom: '1px solid var(--color-border)',
            }}>
              <span style={{ fontSize: '18px' }}>🏫</span>
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text)' }}>{school.name}</span>
            </div>
          ))
        )}
      </div>

      {/* Users table */}
      <div style={{
        background: 'var(--color-bg-card)',
        borderRadius: 'var(--radius)',
        border: '1px solid var(--color-border)',
        overflow: 'hidden',
        marginBottom: '20px',
      }}>
        <div style={{
          padding: '12px 16px',
          borderBottom: '1px solid var(--color-border)',
          fontSize: '14px', fontWeight: 800, color: 'var(--color-accent)', textAlign: 'center',
        }}>
          משתמשי מועצה ({users.length})
        </div>
        {users.length === 0 ? (
          <p style={{ padding: '20px', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '13px' }}>
            אין משתמשים - הוסף משתמש חדש
          </p>
        ) : (
          users.map(user => (
            <div key={user.id} style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '12px 14px', borderBottom: '1px solid var(--color-border)',
            }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '14px', fontWeight: 700, margin: 0, color: 'var(--color-text)' }}>
                  {user.fullName}
                </p>
                <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', margin: '2px 0 0' }}>
                  {user.phone}{user.email ? ` | ${user.email}` : ''}
                </p>
              </div>
              {deleteConfirm === user.id ? (
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button onClick={() => deleteUser(user.id)} style={{
                    background: 'var(--color-danger)', color: '#fff', border: 'none',
                    borderRadius: 'var(--radius-sm)', padding: '6px 12px', fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                  }}>מחק</button>
                  <button onClick={() => setDeleteConfirm(null)} style={{
                    background: 'transparent', color: 'var(--color-text-secondary)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-sm)', padding: '6px 12px', fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                  }}>ביטול</button>
                </div>
              ) : (
                <button onClick={() => setDeleteConfirm(user.id)} style={{
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  fontSize: '16px', color: 'var(--color-text-secondary)', padding: '4px',
                }}>🗑️</button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add user */}
      {!showAdd ? (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button
            onClick={() => setShowAdd(true)}
            style={{
              background: 'var(--color-accent)',
              color: '#fff',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              padding: '12px 32px',
              fontSize: '15px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            + הוסף משתמש מועצה
          </button>
        </div>
      ) : (
        <div style={{
          background: 'var(--color-bg-card)',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--color-accent)',
          padding: '20px',
          maxWidth: '320px',
          margin: '0 auto',
        }}>
          <input
            type="text"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="שם מלא"
            autoFocus
            style={{
              width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border)', background: 'var(--color-bg-secondary)',
              color: 'var(--color-text)', fontSize: '14px', marginBottom: '10px', outline: 'none', boxSizing: 'border-box',
            }}
          />
          <input
            type="tel"
            value={newPhone}
            onChange={e => setNewPhone(e.target.value)}
            placeholder="מספר טלפון"
            style={{
              width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border)', background: 'var(--color-bg-secondary)',
              color: 'var(--color-text)', fontSize: '14px', marginBottom: '10px', outline: 'none', boxSizing: 'border-box',
            }}
          />
          <input
            type="email"
            value={newEmail}
            onChange={e => setNewEmail(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') addUser() }}
            placeholder="מייל (לא חובה)"
            style={{
              width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border)', background: 'var(--color-bg-secondary)',
              color: 'var(--color-text)', fontSize: '14px', marginBottom: '12px', outline: 'none', boxSizing: 'border-box',
            }}
          />
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button onClick={addUser} style={{
              background: 'var(--color-accent)', color: '#fff', border: 'none',
              borderRadius: 'var(--radius-sm)', padding: '10px 24px', fontSize: '14px', fontWeight: 700, cursor: 'pointer',
            }}>הוסף</button>
            <button onClick={() => { setShowAdd(false); setNewName(''); setNewPhone(''); setNewEmail('') }} style={{
              background: 'transparent', color: 'var(--color-text-secondary)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)', padding: '10px 24px', fontSize: '14px', fontWeight: 700, cursor: 'pointer',
            }}>ביטול</button>
          </div>
        </div>
      )}

      {/* Legend */}
      <div style={{
        background: 'var(--color-bg-card)',
        borderRadius: 'var(--radius)',
        border: '1px solid var(--color-border)',
        overflow: 'hidden',
        marginTop: '24px',
      }}>
        <div style={{
          padding: '12px 16px',
          borderBottom: '1px solid var(--color-border)',
          fontSize: '14px', fontWeight: 800, color: 'var(--color-accent)', textAlign: 'center',
        }}>
          מה רואה משתמש מועצה?
        </div>
        {[
          { icon: '🏫', text: 'צפייה בכל בתי הספר של המועצה' },
          { icon: '📝', text: 'גישה לטאב מזכירות בכל בית ספר' },
          { icon: '🔒', text: 'אין גישה להרשאות או ניהול בתי ספר' },
        ].map(item => (
          <div key={item.text} style={{
            padding: '10px 14px', borderBottom: '1px solid var(--color-border)',
            display: 'flex', gap: '10px', alignItems: 'center',
          }}>
            <span style={{ fontSize: '18px', flexShrink: 0 }}>{item.icon}</span>
            <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>{item.text}</span>
          </div>
        ))}
      </div>
    </PageLayout>
  )
}
