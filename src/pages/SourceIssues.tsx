import { useState, useRef } from 'react'
import { getSourceIssues, saveSourceIssues, saveSourceIssuesToDB } from '../data/sourceData'
import { issueChecklist } from '../data/shelterIssues'
import { useStore } from '../data/store'
import PageLayout from '../components/PageLayout'
import * as XLSX from 'xlsx'

export default function SourceIssues() {
  const { currentUser } = useStore()
  const [issues, setIssues] = useState<string[]>(() => {
    const source = getSourceIssues()
    return source.length > 0 ? source : [...issueChecklist]
  })
  const [pendingUpload, setPendingUpload] = useState<string[] | null>(null)
  const [newIssue, setNewIssue] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const update = (list: string[]) => {
    setIssues(list)
    saveSourceIssues(list)
    if (currentUser?.id) saveSourceIssuesToDB(list, currentUser.id)
  }

  const handleDelete = (index: number) => {
    const next = issues.filter((_, i) => i !== index)
    update(next)
  }

  const handleAdd = () => {
    const text = newIssue.trim()
    if (!text) return
    if (issues.includes(text)) return
    update([...issues, text])
    setNewIssue('')
  }

  const handleDownloadTemplate = () => {
    const wb = XLSX.utils.book_new()
    const rows: any[][] = [['מספר', 'תקלה']]
    rows.push([1, 'דוגמה - תקלה'])
    const ws = XLSX.utils.aoa_to_sheet(rows)
    ws['!cols'] = [{ wch: 8 }, { wch: 40 }]
    XLSX.utils.book_append_sheet(wb, ws, 'תקלות')
    XLSX.writeFile(wb, 'תבנית_תקלות.xlsx')
  }

  const handleDownloadCurrent = () => {
    const wb = XLSX.utils.book_new()
    const rows: any[][] = [['מספר', 'תקלה']]
    issues.forEach((issue, i) => rows.push([i + 1, issue]))
    const ws = XLSX.utils.aoa_to_sheet(rows)
    ws['!cols'] = [{ wch: 8 }, { wch: 40 }]
    XLSX.utils.book_append_sheet(wb, ws, 'תקלות')
    XLSX.writeFile(wb, 'טבלת_תקלות_מקלטים.xlsx')
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
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i]
        if (!row) continue
        // Column B (index 1) = issue name, or column A if only one column
        const text = String(row[1] ?? row[0] ?? '').trim()
        if (text) names.push(text)
      }
      if (names.length > 0) setPendingUpload(names)
    }
    reader.readAsArrayBuffer(file)
    e.target.value = ''
  }

  // Upload summary popup
  if (pendingUpload) {
    return (
      <PageLayout title="סיכום העלאה" backTo="/dashboard/sources">
        <div style={{
          background: 'var(--color-bg-card)', borderRadius: 'var(--radius)',
          border: '1px solid var(--color-accent)', padding: '20px', marginBottom: '16px',
        }}>
          <p style={{ fontSize: '16px', fontWeight: 800, textAlign: 'center', marginBottom: '16px', color: 'var(--color-accent)' }}>
            {pendingUpload.length} תקלות
          </p>
          {pendingUpload.map((issue, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between', padding: '8px 0',
              borderBottom: '1px solid var(--color-border)', fontSize: '13px',
            }}>
              <span style={{ fontWeight: 700 }}>{issue}</span>
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
      title="טבלת מקור - תקלות מקלטים"
      subtitle={`${issues.length} תקלות`}
      backTo="/dashboard/sources"
    >
      {/* Issues list */}
      <div style={{
        background: 'var(--color-bg-card)',
        borderRadius: 'var(--radius)',
        border: '1px solid var(--color-border)',
        overflow: 'hidden',
        marginBottom: '16px',
      }}>
        <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--color-border)', background: 'rgba(77, 166, 232, 0.05)' }}>
          <span style={{ fontSize: '17px', fontWeight: 800, color: 'var(--color-accent)' }}>
            רשימת תקלות
          </span>
        </div>
        {issues.length === 0 && (
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '14px' }}>
            אין תקלות ברשימה
          </div>
        )}
        {issues.map((issue, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '12px 14px', borderBottom: '1px solid var(--color-border)',
          }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--color-accent)', width: '32px', textAlign: 'center', flexShrink: 0 }}>
              {i + 1}
            </span>
            <span style={{ fontSize: '13px', fontWeight: 700, flex: 1 }}>{issue}</span>
            <button onClick={() => handleDelete(i)} style={{
              background: 'none', border: 'none', color: 'var(--color-danger)', fontSize: '18px', cursor: 'pointer', padding: '0 8px', lineHeight: 1,
            }}>✕</button>
          </div>
        ))}
      </div>

      {/* Add new issue */}
      <div style={{
        display: 'flex', gap: '8px', marginBottom: '16px',
      }}>
        <input
          type="text"
          value={newIssue}
          onChange={e => setNewIssue(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleAdd() }}
          placeholder="הוסף תקלה חדשה..."
          style={{
            flex: 1, padding: '10px 14px', borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--color-border)', background: 'var(--color-bg-secondary)',
            color: 'var(--color-text)', fontSize: '14px', outline: 'none',
            boxSizing: 'border-box',
          }}
        />
        <button onClick={handleAdd} style={{
          background: 'var(--color-success)', color: '#fff', border: 'none',
          borderRadius: 'var(--radius-sm)', padding: '10px 20px', fontSize: '14px', fontWeight: 700, cursor: 'pointer',
          flexShrink: 0,
        }}>הוסף</button>
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
