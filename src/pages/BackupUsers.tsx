import { useState } from 'react'
import { useStore } from '../data/store'
import PageLayout from '../components/PageLayout'

export default function BackupUsers() {
  const { backupUsers, restoreUser, permanentDeleteUser } = useStore()
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState<string | null>(null)

  const formatDate = (ts: number) =>
    new Date(ts).toLocaleString('he-IL', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })

  const filtered = search.trim()
    ? backupUsers.filter(u =>
        u.fullName.includes(search) || u.phone.includes(search) || u.email.includes(search))
    : backupUsers

  const handleRestore = async (id: string) => {
    if (!confirm('האם לשחזר את המשתמש?')) return
    setLoading(id)
    await restoreUser(id)
    setLoading(null)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('האם למחוק לצמיתות? פעולה זו אינה הפיכה!')) return
    setLoading(id)
    await permanentDeleteUser(id)
    setLoading(null)
  }

  return (
    <PageLayout title="גיבוי - משתמשים" subtitle={`${backupUsers.length} משתמשים בגיבוי`} backTo="/dashboard/backup">

      <div style={{ marginBottom: '16px' }}>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="חיפוש לפי שם, טלפון או אימייל..."
          style={{
            width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--color-border)', background: 'var(--color-bg-secondary)',
            color: 'var(--color-text)', fontSize: '14px', outline: 'none',
          }}
          onFocus={e => e.target.style.borderColor = 'var(--color-accent)'}
          onBlur={e => e.target.style.borderColor = 'rgba(77, 166, 232, 0.2)'}
        />
      </div>

      <div style={{
        background: 'var(--color-bg-card)', borderRadius: 'var(--radius)',
        border: '1px solid var(--color-border)', overflow: 'hidden',
      }}>
        {filtered.length === 0 ? (
          <p style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '13px' }}>
            {search ? 'לא נמצאו תוצאות' : 'אין משתמשים בגיבוי'}
          </p>
        ) : (
          filtered.map(user => (
            <div key={user.id} style={{
              padding: '12px 14px', borderBottom: '1px solid var(--color-border)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <span style={{ fontSize: '14px', fontWeight: 700, flex: 1 }}>{user.fullName}</span>
                <span style={{ fontSize: '10px', color: 'var(--color-text-secondary)' }}>
                  {formatDate(user.deletedAt)}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', direction: 'ltr' }}>
                  {user.phone ? `+972${user.phone}` : '—'}
                </span>
                <span style={{ fontSize: '10px', color: 'var(--color-text-secondary)' }}>
                  נמחק ע"י: {user.deletedBy}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => handleRestore(user.id)}
                  disabled={loading === user.id}
                  style={{
                    padding: '6px 16px', borderRadius: '6px', border: 'none',
                    background: 'var(--color-success)', color: '#fff',
                    fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                    opacity: loading === user.id ? 0.5 : 1,
                  }}
                >
                  שחזור
                </button>
                <button
                  onClick={() => handleDelete(user.id)}
                  disabled={loading === user.id}
                  style={{
                    padding: '6px 16px', borderRadius: '6px', border: 'none',
                    background: 'var(--color-danger)', color: '#fff',
                    fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                    opacity: loading === user.id ? 0.5 : 1,
                  }}
                >
                  מחיקה לצמיתות
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </PageLayout>
  )
}
