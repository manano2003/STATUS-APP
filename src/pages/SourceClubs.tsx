import { useState, useRef } from 'react'
import { type Club } from '../data/clubs'
import { getSourceClubs, saveSourceClubs, saveSourceClubsToDB } from '../data/sourceData'
import { useStore } from '../data/store'
import PageLayout from '../components/PageLayout'
import * as XLSX from 'xlsx'

export default function SourceClubs() {
  const { currentUser, addBackupClub } = useStore()
  const [data, setData] = useState<Club[]>(getSourceClubs)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [newMember, setNewMember] = useState('')
  const [newStaff, setNewStaff] = useState('')
  const [pendingUpload, setPendingUpload] = useState<Club[] | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const totalMembers = data.reduce((sum, c) => sum + c.children.length, 0)
  const totalStaff = data.reduce((sum, c) => sum + c.staff.length, 0)

  const update = (newData: Club[]) => {
    setData(newData)
    saveSourceClubs(newData)
    if (currentUser?.id) saveSourceClubsToDB(newData, currentUser.id)
  }

  const removeMember = (clubId: string, name: string) => {
    const club = data.find(c => c.id === clubId)
    if (club) {
      addBackupClub({
        clubName: club.name,
        personName: name,
        personType: 'member',
        deletedBy: currentUser?.fullName ?? 'unknown',
      })
    }
    update(data.map(c => c.id === clubId ? { ...c, children: c.children.filter(m => m !== name) } : c))
  }

  const removeStaffMember = (clubId: string, name: string) => {
    const club = data.find(c => c.id === clubId)
    if (club) {
      addBackupClub({
        clubName: club.name,
        personName: name,
        personType: 'staff',
        deletedBy: currentUser?.fullName ?? 'unknown',
      })
    }
    update(data.map(c => c.id === clubId ? { ...c, staff: c.staff.filter(s => s !== name) } : c))
  }

  const addMember = (clubId: string) => {
    if (!newMember.trim()) return
    update(data.map(c => c.id === clubId ? { ...c, children: [...c.children, newMember.trim()] } : c))
    setNewMember('')
  }

  const addStaffMember = (clubId: string) => {
    if (!newStaff.trim()) return
    update(data.map(c => c.id === clubId ? { ...c, staff: [...c.staff, newStaff.trim()] } : c))
    setNewStaff('')
  }

  const handleDownloadTemplate = () => {
    const wb = XLSX.utils.book_new()
    const exampleNames = ['שם מועדון 1', 'שם מועדון 2']
    exampleNames.forEach(name => {
      const ws = XLSX.utils.aoa_to_sheet([
        ['שם החבר', 'שם העובד/ת'],
        ['', ''],
      ])
      ws['!cols'] = [{ wch: 20 }, { wch: 20 }]
      XLSX.utils.book_append_sheet(wb, ws, name)
    })
    XLSX.writeFile(wb, 'תבנית_מועדונים.xlsx')
  }

  const handleDownloadCurrent = () => {
    const wb = XLSX.utils.book_new()
    data.forEach(club => {
      const maxLen = Math.max(club.children.length, club.staff.length, 1)
      const rows: (string | undefined)[][] = [['שם החבר', 'שם העובד/ת']]
      for (let i = 0; i < maxLen; i++) {
        rows.push([club.children[i] || '', club.staff[i] || ''])
      }
      const ws = XLSX.utils.aoa_to_sheet(rows)
      ws['!cols'] = [{ wch: 20 }, { wch: 20 }]
      XLSX.utils.book_append_sheet(wb, ws, club.name)
    })
    XLSX.writeFile(wb, 'טבלת_מועדונים.xlsx')
  }

  const handleUploadExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (evt) => {
      const fileData = new Uint8Array(evt.target?.result as ArrayBuffer)
      const wb = XLSX.read(fileData, { type: 'array' })
      const newData: Club[] = wb.SheetNames.map(name => {
        const ws = wb.Sheets[name]
        const rows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 })
        const children: string[] = []
        const staff: string[] = []
        for (let i = 1; i < rows.length; i++) {
          const row = rows[i]
          if (!row) continue
          const memberName = String(row[0] || '').trim()
          const staffName = String(row[1] || '').trim()
          if (memberName) children.push(memberName)
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
    const totalMem = pendingUpload.reduce((s, c) => s + c.children.length, 0)
    const totalStf = pendingUpload.reduce((s, c) => s + c.staff.length, 0)
    return (
      <PageLayout title="⚽ סיכום העלאה" backTo="/dashboard/sources">
        <div style={{
          background: 'var(--color-bg-card)', borderRadius: 'var(--radius)',
          border: '1px solid var(--color-accent)', padding: '20px', marginBottom: '16px',
        }}>
          <p style={{ fontSize: '16px', fontWeight: 800, textAlign: 'center', marginBottom: '16px', color: 'var(--color-accent)' }}>
            {pendingUpload.length} מועדונים | {totalMem} חברים | {totalStf} עובדים
          </p>
          {pendingUpload.map(club => (
            <div key={club.id} style={{
              display: 'flex', justifyContent: 'space-between', padding: '8px 0',
              borderBottom: '1px solid var(--color-border)', fontSize: '13px',
            }}>
              <span style={{ fontWeight: 700 }}>{club.name}</span>
              <span style={{ color: 'var(--color-text-secondary)' }}>{club.children.length} חברים | {club.staff.length} עובדים</span>
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
    <PageLayout title="⚽ טבלת מקור - מועדונים" subtitle={`${data.length} מועדונים | ${totalMembers} חברים | ${totalStaff} עובדים`} backTo="/dashboard/sources">

      <div style={{
        background: 'var(--color-bg-card)',
        borderRadius: 'var(--radius)',
        border: '1px solid var(--color-border)',
        overflow: 'hidden',
        marginBottom: '16px',
      }}>
        {data.map(club => {
          const isExpanded = expandedId === club.id
          return (
            <div key={club.id}>
              <div
                onClick={() => { setExpandedId(isExpanded ? null : club.id); setNewMember(''); setNewStaff('') }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '12px 14px', borderBottom: '1px solid var(--color-border)',
                  cursor: 'pointer', transition: 'background 0.15s',
                  background: isExpanded ? 'rgba(77, 166, 232, 0.05)' : 'transparent',
                }}
              >
                <span style={{ fontSize: '13px', fontWeight: 700, flex: 1 }}>{club.name}</span>
                <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                  {club.children.length} חברים | {club.staff.length} עובדים
                </span>
              </div>

              {isExpanded && (
                <div style={{
                  padding: '8px 14px 12px', borderBottom: '2px solid var(--color-accent)',
                  background: 'rgba(255, 255, 255, 0.06)',
                }}>
                  {club.children.map(member => (
                    <div key={member} style={{ display: 'flex', alignItems: 'center', padding: '10px 0', fontSize: '13px', borderBottom: '1px solid var(--color-border)' }}>
                      <span style={{ flex: 1 }}>{member}</span>
                      <button onClick={() => removeMember(club.id, member)} style={{
                        background: 'none', border: 'none', color: 'var(--color-danger)', fontSize: '18px', cursor: 'pointer', padding: '0 8px',
                      }}>✕</button>
                    </div>
                  ))}
                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                    <input
                      type="text"
                      value={newMember}
                      onChange={e => setNewMember(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') addMember(club.id) }}
                      placeholder="הוסף חבר..."
                      style={{
                        flex: 1, padding: '6px 10px', borderRadius: '6px',
                        border: '1px solid var(--color-border)', background: 'var(--color-bg-secondary)',
                        color: 'var(--color-text)', fontSize: '12px', outline: 'none',
                      }}
                    />
                    <button onClick={() => addMember(club.id)} style={{
                      background: 'var(--color-success)', color: '#fff', border: 'none',
                      borderRadius: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                    }}>+</button>
                  </div>

                  <div style={{ padding: '6px 0', marginTop: '10px', borderTop: '1px solid var(--color-border)', fontSize: '11px', fontWeight: 800, color: 'var(--color-accent)' }}>
                    צוות
                  </div>
                  {club.staff.map(s => (
                    <div key={s} style={{ display: 'flex', alignItems: 'center', padding: '10px 0', fontSize: '13px', borderBottom: '1px solid var(--color-border)' }}>
                      <span style={{ flex: 1, color: 'var(--color-accent)' }}>{s}</span>
                      <button onClick={() => removeStaffMember(club.id, s)} style={{
                        background: 'none', border: 'none', color: 'var(--color-danger)', fontSize: '18px', cursor: 'pointer', padding: '0 8px',
                      }}>✕</button>
                    </div>
                  ))}
                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                    <input
                      type="text"
                      value={newStaff}
                      onChange={e => setNewStaff(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') addStaffMember(club.id) }}
                      placeholder="הוסף עובד/ת..."
                      style={{
                        flex: 1, padding: '6px 10px', borderRadius: '6px',
                        border: '1px solid var(--color-border)', background: 'var(--color-bg-secondary)',
                        color: 'var(--color-text)', fontSize: '12px', outline: 'none',
                      }}
                    />
                    <button onClick={() => addStaffMember(club.id)} style={{
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
