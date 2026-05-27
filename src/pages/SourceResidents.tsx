import { useState, useRef, useMemo } from 'react'
import { getSourceResidents, saveSourceResidents, saveSourceResidentsToDB } from '../data/sourceData'
import { useStore } from '../data/store'
import PageLayout from '../components/PageLayout'
import * as XLSX from 'xlsx'

export default function SourceResidents() {
  const { currentUser, users, addBackupResident } = useStore()
  const [sourceNames, setSourceNames] = useState<string[]>(() => getSourceResidents())
  const [pendingUpload, setPendingUpload] = useState<string[] | null>(null)
  const [search, setSearch] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Merge source residents + registered users, deduplicate by name
  const mergedNames = useMemo(() => {
    const registeredNames = users.map(u => u.fullName).filter(Boolean)
    return Array.from(new Set([...sourceNames, ...registeredNames])).sort((a, b) => a.localeCompare(b, 'he'))
  }, [sourceNames, users])

  const filtered = useMemo(() => {
    if (!search.trim()) return mergedNames
    const q = search.trim().toLowerCase()
    return mergedNames.filter(n => n.toLowerCase().includes(q))
  }, [mergedNames, search])

  const update = (names: string[]) => {
    setSourceNames(names)
    saveSourceResidents(names)
    if (currentUser?.id) saveSourceResidentsToDB(names, currentUser.id)
  }

  const handleDownloadTemplate = () => {
    const wb = XLSX.utils.book_new()
    const rows: any[][] = [['שם התושב']]
    rows.push(['ישראל ישראלי'])
    const ws = XLSX.utils.aoa_to_sheet(rows)
    ws['!cols'] = [{ wch: 30 }]
    XLSX.utils.book_append_sheet(wb, ws, 'תושבים')
    XLSX.writeFile(wb, 'תבנית_תושבים.xlsx')
  }

  const handleDownloadCurrent = () => {
    const wb = XLSX.utils.book_new()
    const rows: any[][] = [['שם התושב']]
    mergedNames.forEach(n => rows.push([n]))
    const ws = XLSX.utils.aoa_to_sheet(rows)
    ws['!cols'] = [{ wch: 30 }]
    XLSX.utils.book_append_sheet(wb, ws, 'תושבים')
    XLSX.writeFile(wb, 'טבלת_תושבים.xlsx')
  }

  const handleUploadExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (evt) => {
      const fileData = new Uint8Array(evt.target?.result as ArrayBuffer)
      const wb = XLSX.read(fileData, { type: 'array' })
      const ws = wb.Sheets[wb.SheetNames[0]]
      const rows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 })

      const names: string[] = []
      // Skip header row (row 0)
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i]
        if (!row || !row[0]) continue
        const name = String(row[0]).trim()
        if (name) names.push(name)
      }

      // Merge with registered users, deduplicate
      const registeredNames = users.map(u => u.fullName).filter(Boolean)
      const merged = Array.from(new Set([...names, ...registeredNames])).sort((a, b) => a.localeCompare(b, 'he'))
      setPendingUpload(merged)
    }
    reader.readAsArrayBuffer(file)
    e.target.value = ''
  }

  if (pendingUpload) {
    return (
      <PageLayout title="🚨 סיכום העלאה" backTo="/dashboard/sources">
        <div style={{
          background: 'var(--color-bg-card)', borderRadius: 'var(--radius)',
          border: '1px solid var(--color-accent)', padding: '20px', marginBottom: '16px',
        }}>
          <p style={{ fontSize: '16px', fontWeight: 800, textAlign: 'center', marginBottom: '16px', color: 'var(--color-accent)' }}>
            {pendingUpload.length} תושבים
          </p>
          {pendingUpload.map((name, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between', padding: '8px 0',
              borderBottom: '1px solid var(--color-border)', fontSize: '13px',
            }}>
              <span style={{ fontWeight: 700 }}>{name}</span>
              <span style={{ color: 'var(--color-text-secondary)', fontSize: '11px' }}>{i + 1}</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button onClick={() => { update(pendingUpload); setPendingUpload(null) }} style={{
            background: 'var(--color-success)', color: '#fff', border: 'none',
            borderRadius: 'var(--radius-sm)', padding: '12px 32px', fontSize: '15px', fontWeight: 700, cursor: 'pointer',
          }}>אישור והעלאה</button>
          <button onClick={() => setPendingUpload(null)} style={{
            background: 'transparent', color: 'var(--color-text-secondary)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)', padding: '12px 32px', fontSize: '15px', fontWeight: 700, cursor: 'pointer',
          }}>ביטול</button>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout
      title="🚨 טבלת מקור - תושבים"
      subtitle={`${mergedNames.length} תושבים`}
      backTo="/dashboard/sources"
    >
      {/* Search bar */}
      <div style={{ marginBottom: '16px' }}>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="חיפוש תושב..."
          style={{
            width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--color-border)', background: 'var(--color-bg-secondary)',
            color: 'var(--color-text)', fontSize: '14px', outline: 'none',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Residents list */}
      <div style={{
        background: 'var(--color-bg-card)',
        borderRadius: 'var(--radius)',
        border: '1px solid var(--color-border)',
        overflow: 'hidden',
        marginBottom: '16px',
      }}>
        <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--color-border)', background: 'rgba(77, 166, 232, 0.05)' }}>
          <span style={{ fontSize: '17px', fontWeight: 800, color: 'var(--color-accent)' }}>
            תושבים {search.trim() ? `(${filtered.length} מתוך ${mergedNames.length})` : ''}
          </span>
        </div>
        {filtered.length === 0 && (
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '14px' }}>
            לא נמצאו תושבים
          </div>
        )}
        {filtered.map((name, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '12px 14px', borderBottom: '1px solid var(--color-border)',
          }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--color-accent)', width: '32px', textAlign: 'center', flexShrink: 0 }}>
              {i + 1}
            </span>
            <span style={{ fontSize: '13px', fontWeight: 700, flex: 1 }}>{name}</span>
            <button onClick={async () => {
              await addBackupResident(name, currentUser?.fullName || 'unknown')
              const newNames = sourceNames.filter(n => n !== name)
              update(newNames)
            }} style={{
              background: 'none', border: 'none', color: 'var(--color-danger)', fontSize: '18px', cursor: 'pointer', padding: '0 8px', lineHeight: 1,
            }}>✕</button>
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button onClick={() => fileInputRef.current?.click()} style={{
          background: 'var(--color-accent)', color: '#fff', border: 'none',
          borderRadius: 'var(--radius-sm)', padding: '12px 24px', fontSize: '14px', fontWeight: 700, cursor: 'pointer',
        }}>העלאת אקסל</button>
        <button onClick={handleDownloadTemplate} style={{
          background: 'transparent', color: 'var(--color-accent)', border: '1px solid var(--color-accent)',
          borderRadius: 'var(--radius-sm)', padding: '12px 24px', fontSize: '14px', fontWeight: 700, cursor: 'pointer',
        }}>הורד תבנית</button>
        <button onClick={handleDownloadCurrent} style={{
          background: 'transparent', color: 'var(--color-accent)', border: '1px solid var(--color-accent)',
          borderRadius: 'var(--radius-sm)', padding: '12px 24px', fontSize: '14px', fontWeight: 700, cursor: 'pointer',
        }}>הורד נתונים קיימים</button>
      </div>
      <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" style={{ display: 'none' }} onChange={handleUploadExcel} />
    </PageLayout>
  )
}
