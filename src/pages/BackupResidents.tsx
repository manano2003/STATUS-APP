import { useState } from 'react'
import { useStore } from '../data/store'
import PageLayout from '../components/PageLayout'

export default function BackupResidents() {
  const { backupResidents, restoreResident, permanentDeleteResident } = useStore()
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState<string | null>(null)

  const formatDate = (ts: number) =>
    new Date(ts).toLocaleString('he-IL', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })

  const filtered = search.trim()
    ? backupResidents.filter(r => r.residentName.includes(search))
    : backupResidents

  const handleRestore = async (id: string) => {
    if (!confirm('האם לשחזר את התושב?')) return
    setLoading(id)
    await restoreResident(id)
    setLoading(null)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('האם למחוק לצמיתות? פעולה זו אינה הפיכה!')) return
    setLoading(id)
    await permanentDeleteResident(id)
    setLoading(null)
  }

  return (
    <PageLayout title="גיבוי - תושבים" subtitle={`${backupResidents.length} תושבים בגיבוי`} backTo="/dashboard/backup">

      <div style={{ marginBottom: '16px' }}>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="חיפוש לפי שם..."
          style={{
            width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--color-border)', background: 'var(--color-bg-secondary)',
            color: 'var(--color-text)', fontSize: '14px', outline: 'none',
            boxSizing: 'border-box',
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
            {search ? 'לא נמצאו תוצאות' : 'אין תושבים בגיבוי'}
          </p>
        ) : (
          filtered.map(entry => (
            <div key={entry.id} style={{
              padding: '12px 14px', borderBottom: '1px solid var(--color-border)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <span style={{ fontSize: '14px', fontWeight: 700, flex: 1 }}>{entry.residentName}</span>
                <span style={{ fontSize: '10px', color: 'var(--color-text-secondary)' }}>
                  {formatDate(entry.deletedAt)}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '10px', color: 'var(--color-text-secondary)' }}>
                  נמחק ע"י: {entry.deletedBy}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => handleRestore(entry.id)}
                  disabled={loading === entry.id}
                  style={{
                    padding: '6px 16px', borderRadius: '6px', border: 'none',
                    background: 'var(--color-success)', color: '#fff',
                    fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                    opacity: loading === entry.id ? 0.5 : 1,
                  }}
                >
                  שחזור
                </button>
                <button
                  onClick={() => handleDelete(entry.id)}
                  disabled={loading === entry.id}
                  style={{
                    padding: '6px 16px', borderRadius: '6px', border: 'none',
                    background: 'var(--color-danger)', color: '#fff',
                    fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                    opacity: loading === entry.id ? 0.5 : 1,
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
