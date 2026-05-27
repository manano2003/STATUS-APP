import { useRef, useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useStore } from '../data/store'
import { supabase } from '../data/supabase'
import { loadSchoolUsersFromDB, saveSchoolUsersToDB, getSchoolUsersFromCache } from '../data/sourceData'
import SchoolHome from './SchoolHome'
import * as XLSX from 'xlsx'

export default function SchoolUsers() {
  const { schoolId } = useParams<{ schoolId: string }>()
  const navigate = useNavigate()
  const { currentUser } = useStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [search, setSearch] = useState('')
  const [pendingUpload, setPendingUpload] = useState<any[] | null>(null)

  const [schoolUsers, setSchoolUsers] = useState<any[]>(() => getSchoolUsersFromCache(schoolId || ''))

  useEffect(() => {
    if (!schoolId) return
    loadSchoolUsersFromDB(schoolId).then(setSchoolUsers)
    const channel = supabase.channel(`users-${schoolId}`)
      .on('postgres_changes', { event: '*', schema: 'status', table: 'school_users', filter: `school_id=eq.${schoolId}` }, () => {
        loadSchoolUsersFromDB(schoolId).then(setSchoolUsers)
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [schoolId])

  const filtered = schoolUsers.filter((u: any) => {
    if (!search.trim()) return true
    const q = search.trim().toLowerCase()
    return u.fullName?.toLowerCase().includes(q) || u.className?.toLowerCase().includes(q)
  })

  const handleDownloadTemplate = () => {
    const rows: any[][] = [['מספר', 'שם מלא', 'מספר טלפון', 'מייל', 'כיתה']]
    for (let i = 1; i <= 35; i++) rows.push([i, '', '', '', ''])
    const ws = XLSX.utils.aoa_to_sheet(rows)
    ws['!cols'] = [{ wch: 8 }, { wch: 20 }, { wch: 15 }, { wch: 25 }, { wch: 10 }]
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'צוות')
    XLSX.writeFile(wb, 'תבנית_סגל.xlsx')
  }

  const handleUploadExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target?.result as ArrayBuffer)
      const wb = XLSX.read(data, { type: 'array' })
      const ws = wb.Sheets[wb.SheetNames[0]]
      const rows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 })
      const newUsers: any[] = []
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i]
        if (!row || !row[1]) continue
        const fullName = String(row[1] || '').trim()
        if (!fullName) continue
        newUsers.push({
          id: Date.now().toString() + '-' + i,
          fullName,
          phone: String(row[2] || '').trim().replace(/\D/g, ''),
          email: String(row[3] || '').trim(),
          className: String(row[4] || '').trim(),
        })
      }
      setPendingUpload(newUsers)
    }
    reader.readAsArrayBuffer(file)
    e.target.value = ''
  }

  if (pendingUpload) {
    return (
      <SchoolHome backTo={`/schools/${schoolId}/sources`} content={
        <div style={{
          background: 'var(--color-bg-card)', borderRadius: 'var(--radius)',
          border: '1px solid var(--color-accent)', padding: '20px', marginBottom: '16px',
        }}>
          <p style={{ fontSize: '16px', fontWeight: 800, textAlign: 'center', marginBottom: '16px', color: 'var(--color-accent)' }}>
            {pendingUpload.length} אנשי סגל
          </p>
          {pendingUpload.map((u, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between', padding: '8px 0',
              borderBottom: '1px solid var(--color-border)', fontSize: '13px',
            }}>
              <span style={{ fontWeight: 700 }}>{u.fullName}</span>
              <span style={{ color: 'var(--color-text-secondary)' }}>{u.className ? `כיתה ${u.className}` : ''}</span>
            </div>
          ))}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '16px' }}>
            <button onClick={() => {
              setSchoolUsers(pendingUpload)
              saveSchoolUsersToDB(schoolId || '', pendingUpload, currentUser?.id || '')
              setPendingUpload(null)
            }} style={{
              background: 'var(--color-success)', color: '#fff', border: 'none',
              borderRadius: 'var(--radius-sm)', padding: '12px 32px', fontSize: '15px', fontWeight: 700, cursor: 'pointer',
            }}>אישור והעלאה</button>
            <button onClick={() => setPendingUpload(null)} style={{
              background: 'transparent', color: 'var(--color-text-secondary)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)', padding: '12px 32px', fontSize: '15px', fontWeight: 700, cursor: 'pointer',
            }}>ביטול</button>
          </div>
        </div>
      } />
    )
  }

  return (
    <SchoolHome backTo={`/schools/${schoolId}/sources`} content={
      <>
        {/* Search */}
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

        {/* Title */}
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-accent)', marginBottom: '8px' }}>
          צוות בית הספר ({filtered.length})
        </h3>

        {/* Table */}
        <div style={{
          background: 'var(--color-bg-card)',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--color-border)',
          overflow: 'hidden',
          marginBottom: '24px',
        }}>
          {filtered.length === 0 ? (
            <p style={{ padding: '20px', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '13px' }}>
              אין משתמשים רשומים
            </p>
          ) : (
            <>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1.5fr 1fr 0.8fr 0.6fr 36px',
                padding: '10px 12px',
                borderBottom: '1px solid var(--color-border)',
                fontSize: '11px', fontWeight: 700, color: 'var(--color-text-secondary)',
              }}>
                <span>שם מלא</span>
                <span>טלפון</span>
                <span style={{ textAlign: 'center' }}>מייל</span>
                <span style={{ textAlign: 'center' }}>כיתה</span>
                <span></span>
              </div>
              {filtered.map((user: any, i: number) => (
                <div key={user.id || i} style={{
                  display: 'grid', gridTemplateColumns: '1.5fr 1fr 0.8fr 0.6fr 36px',
                  padding: '10px 12px', borderBottom: '1px solid var(--color-border)',
                  fontSize: '12px',
                }}>
                  <span style={{ fontWeight: 600, color: 'var(--color-accent)' }}>{user.fullName}</span>
                  <span style={{ direction: 'ltr', textAlign: 'right', fontSize: '11px' }}>{user.phone ? `+972${user.phone}` : '—'}</span>
                  <span style={{ fontSize: '10px', color: 'var(--color-text-secondary)', textAlign: 'center' }}>{user.email || '—'}</span>
                  <span style={{ fontSize: '11px', textAlign: 'center' }}>{user.className || '—'}</span>
                  <button style={{ background: 'none', border: 'none', color: 'var(--color-danger)', fontSize: '16px', cursor: 'pointer', padding: '0', lineHeight: 1 }}>✕</button>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => fileInputRef.current?.click()} style={{
            background: 'var(--color-accent)', color: '#fff', border: 'none',
            borderRadius: 'var(--radius-sm)', padding: '12px 24px', fontSize: '14px', fontWeight: 700, cursor: 'pointer',
          }}>העלאת אקסל</button>
          <button onClick={handleDownloadTemplate} style={{
            background: 'transparent', color: 'var(--color-accent)', border: '1px solid var(--color-accent)',
            borderRadius: 'var(--radius-sm)', padding: '12px 24px', fontSize: '14px', fontWeight: 700, cursor: 'pointer',
          }}>הורד תבנית</button>
          <button onClick={() => navigate(`/schools/${schoolId}/permissions`)} style={{
            background: 'transparent', color: 'var(--color-warning)', border: '1px solid var(--color-warning)',
            borderRadius: 'var(--radius-sm)', padding: '12px 24px', fontSize: '14px', fontWeight: 700, cursor: 'pointer',
          }}>הרשאות</button>
        </div>
        <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" style={{ display: 'none' }} onChange={handleUploadExcel} />
      </>
    } />
  )
}
