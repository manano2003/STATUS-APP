import { useState, useRef, useEffect } from 'react'
import { type Kindergarten } from '../data/kindergartens'
import { getSourceKindergartens, saveSourceKindergartens, saveSourceKindergartensToDB, loadSourceKindergartensFromDB } from '../data/sourceData'
import { useStore } from '../data/store'
import PageLayout from '../components/PageLayout'
import * as XLSX from 'xlsx'

export default function SourceKindergartens() {
  const { currentUser, addBackupKindergarten } = useStore()
  const [data, setData] = useState<Kindergarten[]>(getSourceKindergartens)

  useEffect(() => {
    loadSourceKindergartensFromDB().then(d => { if (d.length > 0) setData(d) })
  }, [])
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [newChild, setNewChild] = useState('')
  const [newStaff, setNewStaff] = useState('')
  const [pendingUpload, setPendingUpload] = useState<Kindergarten[] | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const totalChildren = data.reduce((sum, k) => sum + k.children.length, 0)
  const totalStaff = data.reduce((sum, k) => sum + k.staff.length, 0)

  const update = (newData: Kindergarten[]) => {
    setData(newData)
    saveSourceKindergartens(newData)
    if (currentUser?.id) saveSourceKindergartensToDB(newData, currentUser.id)
  }

  const removeChild = (kgId: string, childName: string) => {
    const kg = data.find(k => k.id === kgId)
    if (kg) {
      addBackupKindergarten({
        kindergartenName: kg.name,
        personName: childName,
        personType: 'child',
        deletedBy: currentUser?.fullName ?? 'unknown',
      })
    }
    update(data.map(k => k.id === kgId ? { ...k, children: k.children.filter(c => c !== childName) } : k))
  }

  const removeStaffMember = (kgId: string, name: string) => {
    const kg = data.find(k => k.id === kgId)
    if (kg) {
      addBackupKindergarten({
        kindergartenName: kg.name,
        personName: name,
        personType: 'staff',
        deletedBy: currentUser?.fullName ?? 'unknown',
      })
    }
    update(data.map(k => k.id === kgId ? { ...k, staff: k.staff.filter(s => s !== name) } : k))
  }

  const addChild = (kgId: string) => {
    if (!newChild.trim()) return
    update(data.map(k => k.id === kgId ? { ...k, children: [...k.children, newChild.trim()] } : k))
    setNewChild('')
  }

  const addStaffMember = (kgId: string) => {
    if (!newStaff.trim()) return
    update(data.map(k => k.id === kgId ? { ...k, staff: [...k.staff, newStaff.trim()] } : k))
    setNewStaff('')
  }

  // Download template - same format as the original Excel (one sheet per kindergarten)
  const handleDownloadTemplate = () => {
    const wb = XLSX.utils.book_new()
    // Create example sheets
    const exampleNames = ['שם הגן 1', 'שם הגן 2']
    exampleNames.forEach(name => {
      const ws = XLSX.utils.aoa_to_sheet([
        ['שם הילד', 'שם העובדת'],
        ['', ''],
      ])
      ws['!cols'] = [{ wch: 20 }, { wch: 20 }]
      XLSX.utils.book_append_sheet(wb, ws, name)
    })
    XLSX.writeFile(wb, 'תבנית_גנים.xlsx')
  }

  // Download current data in the same format
  const handleDownloadCurrent = () => {
    const wb = XLSX.utils.book_new()
    data.forEach(kg => {
      const maxLen = Math.max(kg.children.length, kg.staff.length, 1)
      const rows: (string | undefined)[][] = [['שם הילד', 'שם העובדת']]
      for (let i = 0; i < maxLen; i++) {
        rows.push([kg.children[i] || '', kg.staff[i] || ''])
      }
      const ws = XLSX.utils.aoa_to_sheet(rows)
      ws['!cols'] = [{ wch: 20 }, { wch: 20 }]
      XLSX.utils.book_append_sheet(wb, ws, kg.name)
    })
    XLSX.writeFile(wb, 'טבלת_גנים.xlsx')
  }

  // Upload Excel - read sheets as kindergartens
  const handleUploadExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (evt) => {
      const fileData = new Uint8Array(evt.target?.result as ArrayBuffer)
      const wb = XLSX.read(fileData, { type: 'array' })
      const newData: Kindergarten[] = wb.SheetNames.map(name => {
        const ws = wb.Sheets[name]
        const rows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 })
        const children: string[] = []
        const staff: string[] = []
        // Skip header row
        for (let i = 1; i < rows.length; i++) {
          const row = rows[i]
          if (!row) continue
          const childName = String(row[0] || '').trim()
          const staffName = String(row[1] || '').trim()
          if (childName) children.push(childName)
          if (staffName) staff.push(staffName)
        }
        return {
          id: name.replace(/\s+/g, '-').toLowerCase(),
          name,
          children: [...new Set(children)],
          staff: [...new Set(staff)],
        }
      })
      setPendingUpload(newData)
    }
    reader.readAsArrayBuffer(file)
    e.target.value = ''
  }

  if (pendingUpload) {
    const totalKids = pendingUpload.reduce((s, k) => s + k.children.length, 0)
    const totalStf = pendingUpload.reduce((s, k) => s + k.staff.length, 0)
    return (
      <PageLayout title="👶 סיכום העלאה" backTo="/dashboard/sources">
        <div style={{
          background: 'var(--color-bg-card)', borderRadius: 'var(--radius)',
          border: '1px solid var(--color-accent)', padding: '20px', marginBottom: '16px',
        }}>
          <p style={{ fontSize: '16px', fontWeight: 800, textAlign: 'center', marginBottom: '16px', color: 'var(--color-accent)' }}>
            {pendingUpload.length} גנים | {totalKids} ילדים | {totalStf} עובדים
          </p>
          {pendingUpload.map(kg => (
            <div key={kg.id} style={{
              display: 'flex', justifyContent: 'space-between', padding: '8px 0',
              borderBottom: '1px solid var(--color-border)', fontSize: '13px',
            }}>
              <span style={{ fontWeight: 700 }}>{kg.name}</span>
              <span style={{ color: 'var(--color-text-secondary)' }}>{kg.children.length} ילדים | {kg.staff.length} עובדים</span>
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
    <PageLayout title="👶 טבלת מקור - גנים" subtitle={`${data.length} גנים | ${totalChildren} ילדים | ${totalStaff} עובדים`} backTo="/dashboard/sources">

      <div style={{
        background: 'var(--color-bg-card)',
        borderRadius: 'var(--radius)',
        border: '1px solid var(--color-border)',
        overflow: 'hidden',
        marginBottom: '16px',
      }}>
        {data.map(kg => {
          const isExpanded = expandedId === kg.id
          return (
            <div key={kg.id}>
              <div
                onClick={() => { setExpandedId(isExpanded ? null : kg.id); setNewChild(''); setNewStaff('') }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '12px 14px', borderBottom: '1px solid var(--color-border)',
                  cursor: 'pointer', transition: 'background 0.15s',
                  background: isExpanded ? 'rgba(77, 166, 232, 0.05)' : 'transparent',
                }}
              >
                <span style={{ fontSize: '13px', fontWeight: 700, flex: 1 }}>{kg.name}</span>
                <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                  {kg.children.length} ילדים | {kg.staff.length} עובדים
                </span>
              </div>

              {isExpanded && (
                <div style={{
                  padding: '8px 14px 12px', borderBottom: '2px solid var(--color-accent)',
                  background: 'rgba(255, 255, 255, 0.06)',
                }}>
                  {kg.children.map(child => (
                    <div key={child} style={{ display: 'flex', alignItems: 'center', padding: '10px 0', fontSize: '13px', borderBottom: '1px solid var(--color-border)' }}>
                      <span style={{ flex: 1 }}>{child}</span>
                      <button onClick={() => removeChild(kg.id, child)} style={{
                        background: 'none', border: 'none', color: 'var(--color-danger)', fontSize: '18px', cursor: 'pointer', padding: '0 8px',
                      }}>✕</button>
                    </div>
                  ))}
                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                    <input
                      type="text"
                      value={newChild}
                      onChange={e => setNewChild(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') addChild(kg.id) }}
                      placeholder="הוסף ילד..."
                      style={{
                        flex: 1, padding: '6px 10px', borderRadius: '6px',
                        border: '1px solid var(--color-border)', background: 'var(--color-bg-secondary)',
                        color: 'var(--color-text)', fontSize: '12px', outline: 'none',
                      }}
                    />
                    <button onClick={() => addChild(kg.id)} style={{
                      background: 'var(--color-success)', color: '#fff', border: 'none',
                      borderRadius: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                    }}>+</button>
                  </div>

                  <div style={{ padding: '6px 0', marginTop: '10px', borderTop: '1px solid var(--color-border)', fontSize: '11px', fontWeight: 800, color: 'var(--color-accent)' }}>
                    סגל
                  </div>
                  {kg.staff.map(member => (
                    <div key={member} style={{ display: 'flex', alignItems: 'center', padding: '10px 0', fontSize: '13px', borderBottom: '1px solid var(--color-border)' }}>
                      <span style={{ flex: 1, color: 'var(--color-accent)' }}>{member}</span>
                      <button onClick={() => removeStaffMember(kg.id, member)} style={{
                        background: 'none', border: 'none', color: 'var(--color-danger)', fontSize: '18px', cursor: 'pointer', padding: '0 8px',
                      }}>✕</button>
                    </div>
                  ))}
                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                    <input
                      type="text"
                      value={newStaff}
                      onChange={e => setNewStaff(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') addStaffMember(kg.id) }}
                      placeholder="הוסף עובד/ת..."
                      style={{
                        flex: 1, padding: '6px 10px', borderRadius: '6px',
                        border: '1px solid var(--color-border)', background: 'var(--color-bg-secondary)',
                        color: 'var(--color-text)', fontSize: '12px', outline: 'none',
                      }}
                    />
                    <button onClick={() => addStaffMember(kg.id)} style={{
                      background: 'var(--color-accent)', color: '#fff', border: 'none',
                      borderRadius: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                    }}>+</button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

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
