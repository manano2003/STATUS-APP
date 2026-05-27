import { useState } from 'react'
import { useStore } from '../data/store'
import PageLayout from '../components/PageLayout'

export default function BackupKindergartens() {
  const { backupKindergartens, restoreKindergarten, permanentDeleteKindergarten } = useStore()
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState<string | null>(null)

  const formatDate = (ts: number) =>
    new Date(ts).toLocaleString('he-IL', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })

  const filtered = search.trim()
    ? backupKindergartens.filter(e =>
        e.personName.includes(search) || e.kindergartenName.includes(search))
    : backupKindergartens

  // Group by kindergarten
  const groups: Record<string, typeof filtered> = {}
  filtered.forEach(e => {
    if (!groups[e.kindergartenName]) groups[e.kindergartenName] = []
    groups[e.kindergartenName].push(e)
  })

  const handleRestore = async (id: string) => {
    if (!confirm('האם לשחזר?')) return
    setLoading(id)
    await restoreKindergarten(id)
    setLoading(null)
    // Verify restore worked
    const backup = backupKindergartens.find(b => b.id === id)
    if (backup) {
      const kgs = JSON.parse(localStorage.getItem('source_kindergartens') || '[]')
      const kg = kgs.find((k: any) => k.name === backup.kindergartenName)
      if (!kg || !(kg.children.includes(backup.personName) || kg.staff.includes(backup.personName))) {
        alert('שגיאה בשחזור - הפריט לא נמצא ברשימה. נסה שוב.')
      }
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('האם למחוק לצמיתות? פעולה זו אינה הפיכה!')) return
    setLoading(id)
    await permanentDeleteKindergarten(id)
    setLoading(null)
  }

  return (
    <PageLayout title="גיבוי - גנים" subtitle={`${backupKindergartens.length} פריטים בגיבוי`} backTo="/dashboard/backup">

      <div style={{ marginBottom: '16px' }}>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="חיפוש לפי שם או גן..."
          style={{
            width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--color-border)', background: 'var(--color-bg-secondary)',
            color: 'var(--color-text)', fontSize: '14px', outline: 'none',
          }}
          onFocus={e => e.target.style.borderColor = 'var(--color-accent)'}
          onBlur={e => e.target.style.borderColor = 'rgba(77, 166, 232, 0.2)'}
        />
      </div>

      {Object.keys(groups).length === 0 ? (
        <div style={{
          background: 'var(--color-bg-card)', borderRadius: 'var(--radius)',
          border: '1px solid var(--color-border)', padding: '32px', textAlign: 'center',
        }}>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px', margin: 0 }}>
            {search ? 'לא נמצאו תוצאות' : 'אין פריטים בגיבוי'}
          </p>
        </div>
      ) : (
        Object.entries(groups).map(([kgName, entries]) => (
          <div key={kgName} style={{
            background: 'var(--color-bg-card)', borderRadius: 'var(--radius)',
            border: '1px solid var(--color-border)', overflow: 'hidden', marginBottom: '12px',
          }}>
            <div style={{
              padding: '10px 14px', borderBottom: '1px solid var(--color-border)',
              fontSize: '13px', fontWeight: 800, color: 'var(--color-accent)',
            }}>
              {kgName} ({entries.length})
            </div>
            {entries.map(entry => (
              <div key={entry.id} style={{
                padding: '10px 14px', borderBottom: '1px solid var(--color-border)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, flex: 1 }}>{entry.personName}</span>
                  <span style={{
                    fontSize: '10px', padding: '1px 6px', borderRadius: '4px',
                    background: entry.personType === 'child' ? 'rgba(77, 166, 232, 0.15)' : 'rgba(232, 197, 77, 0.15)',
                    color: entry.personType === 'child' ? 'var(--color-accent)' : 'var(--color-warning)',
                  }}>
                    {entry.personType === 'child' ? 'ילד/ה' : 'סגל'}
                  </span>
                  <span style={{ fontSize: '10px', color: 'var(--color-text-secondary)' }}>
                    {formatDate(entry.deletedAt)}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => handleRestore(entry.id)}
                    disabled={loading === entry.id}
                    style={{
                      padding: '5px 14px', borderRadius: '6px', border: 'none',
                      background: 'var(--color-success)', color: '#fff',
                      fontSize: '11px', fontWeight: 700, cursor: 'pointer',
                      opacity: loading === entry.id ? 0.5 : 1,
                    }}
                  >
                    שחזור
                  </button>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    disabled={loading === entry.id}
                    style={{
                      padding: '5px 14px', borderRadius: '6px', border: 'none',
                      background: 'var(--color-danger)', color: '#fff',
                      fontSize: '11px', fontWeight: 700, cursor: 'pointer',
                      opacity: loading === entry.id ? 0.5 : 1,
                    }}
                  >
                    מחיקה לצמיתות
                  </button>
                </div>
              </div>
            ))}
          </div>
        ))
      )}
    </PageLayout>
  )
}
