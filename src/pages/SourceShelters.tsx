import { useState, useRef } from 'react'
import { type Shelter } from '../data/shelters'
import { getSourceShelters, saveSourceShelters, saveSourceSheltersToDB } from '../data/sourceData'
import { shelters as defaultShelters } from '../data/shelters'
import { useStore } from '../data/store'
import { supabase } from '../data/supabase'
import PageLayout from '../components/PageLayout'
import * as XLSX from 'xlsx'

export default function SourceShelters() {
  const { currentUser } = useStore()
  const [data, setData] = useState<Shelter[]>(() => {
    const source = getSourceShelters()
    return source.length > 0 ? source : defaultShelters
  })
  const [pendingUpload, setPendingUpload] = useState<Shelter[] | null>(null)
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [newIsSpecial, setNewIsSpecial] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const [uploadingImageId, setUploadingImageId] = useState<string | null>(null)

  const pendingImageId = useRef<string | null>(null)

  const handleImageClick = (shelterName: string) => {
    pendingImageId.current = shelterName
    setUploadingImageId(shelterName)
    setTimeout(() => imageInputRef.current?.click(), 100)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    const targetId = pendingImageId.current
    if (!file || !targetId) { return }
    try {
      const fileName = `shelter-${Date.now()}.jpg`
      const url = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/shelter-images/${fileName}`
      const key = import.meta.env.VITE_SUPABASE_ANON_KEY
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'apikey': key,
          'Authorization': `Bearer ${key}`,
          'Content-Type': file.type,
        },
        body: file,
      })
      if (res.ok) {
        const imageUrl = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/shelter-images/${fileName}`
        const fresh = getSourceShelters()
        const updated = fresh.map(s => s.name === targetId ? { ...s, imageUrl } : s)
        saveSourceShelters(updated)
        if (currentUser?.id) saveSourceSheltersToDB(updated, currentUser.id)
        window.location.reload()
      } else {
        const errText = await res.text()
        alert('שגיאה בהעלאה: ' + errText)
      }
    } catch (err: any) {
      alert('שגיאה: ' + (err?.message || 'לא ידועה'))
    }
    pendingImageId.current = null
    setUploadingImageId(null)
    e.target.value = ''
  }

  const regularShelters = data.filter(s => !s.isSpecialStatus)
  const specialStatuses = data.filter(s => s.isSpecialStatus)

  const update = (newData: Shelter[]) => {
    setData(newData)
    saveSourceShelters(newData)
    if (currentUser?.id) saveSourceSheltersToDB(newData, currentUser.id)
  }

  const removeShelter = (id: string) => {
    update(data.filter(s => s.id !== id))
  }

  const addShelter = () => {
    if (!newName.trim()) return
    const num = newIsSpecial ? (Math.max(...data.map(s => s.number), 0) + 1) : parseInt(newNumber)
    if (!newIsSpecial && isNaN(num)) return
    const id = newName.trim().replace(/\s+/g, '-').replace(/[/"]/g, '').toLowerCase()
    const shelter: Shelter = {
      id,
      name: newName.trim(),
      number: num,
      imageUrl: '',
      isSpecialStatus: newIsSpecial,
    }
    update([...data, shelter])
    setNewName('')
    setNewNumber('')
    setNewIsSpecial(false)
  }

  const handleDownloadTemplate = () => {
    const wb = XLSX.utils.book_new()
    const rows: any[][] = [['מספר מקלט', 'שם מקלט']]
    rows.push([1, 'מקלט לדוגמה'])
    rows.push(['סטטוס אישי', 'סטטוס לדוגמה'])
    const ws = XLSX.utils.aoa_to_sheet(rows)
    ws['!cols'] = [{ wch: 15 }, { wch: 25 }]
    XLSX.utils.book_append_sheet(wb, ws, 'מקלטים')
    XLSX.writeFile(wb, 'תבנית_מקלטים.xlsx')
  }

  const handleDownloadCurrent = () => {
    const wb = XLSX.utils.book_new()
    const rows: any[][] = [['מספר מקלט', 'שם מקלט']]
    data.forEach(s => {
      rows.push([s.isSpecialStatus ? 'סטטוס אישי' : s.number, s.name])
    })
    const ws = XLSX.utils.aoa_to_sheet(rows)
    ws['!cols'] = [{ wch: 15 }, { wch: 25 }]
    XLSX.utils.book_append_sheet(wb, ws, 'מקלטים')
    XLSX.writeFile(wb, 'טבלת_מקלטים.xlsx')
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

      const newData: Shelter[] = []
      // Skip header row
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i]
        if (!row || !row[1]) continue
        const colA = String(row[0] || '').trim()
        const name = String(row[1]).trim()
        if (!name) continue

        const isSpecial = colA === 'סטטוס אישי'
        const number = isSpecial ? (100 + i) : parseInt(colA)
        if (!isSpecial && isNaN(number)) continue

        const id = name.replace(/\s+/g, '-').replace(/[/"]/g, '').toLowerCase()

        // Try to keep existing imageUrl if shelter name matches
        const existing = data.find(s => s.name === name || s.id === id)

        newData.push({
          id,
          name,
          number: isSpecial ? (100 + i) : number,
          imageUrl: existing?.imageUrl || '',
          isSpecialStatus: isSpecial,
        })
      }
      setPendingUpload(newData)
    }
    reader.readAsArrayBuffer(file)
    e.target.value = ''
  }

  if (pendingUpload) {
    const regular = pendingUpload.filter(s => !s.isSpecialStatus)
    const special = pendingUpload.filter(s => s.isSpecialStatus)
    return (
      <PageLayout title="🏛️ סיכום העלאה" backTo="/dashboard/sources">
        <div style={{
          background: 'var(--color-bg-card)', borderRadius: 'var(--radius)',
          border: '1px solid var(--color-accent)', padding: '20px', marginBottom: '16px',
        }}>
          <p style={{ fontSize: '16px', fontWeight: 800, textAlign: 'center', marginBottom: '16px', color: 'var(--color-accent)' }}>
            {regular.length} מקלטים | {special.length} סטטוסים אישיים
          </p>
          {pendingUpload.map(s => (
            <div key={s.id} style={{
              display: 'flex', justifyContent: 'space-between', padding: '8px 0',
              borderBottom: '1px solid var(--color-border)', fontSize: '13px',
            }}>
              <span style={{ fontWeight: 700 }}>{s.name}</span>
              <span style={{ color: 'var(--color-text-secondary)' }}>
                {s.isSpecialStatus ? 'סטטוס אישי' : `מקלט #${s.number}`}
              </span>
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
      title="🏛️ טבלת מקור - מקלטים"
      subtitle={`${regularShelters.length} מקלטים | ${specialStatuses.length} סטטוסים אישיים`}
      backTo="/dashboard/sources"
    >
      {/* Regular shelters */}
      <div style={{
        background: 'var(--color-bg-card)',
        borderRadius: 'var(--radius)',
        border: '1px solid var(--color-border)',
        overflow: 'hidden',
        marginBottom: '16px',
      }}>
        <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--color-border)', background: 'rgba(77, 166, 232, 0.05)' }}>
          <span style={{ fontSize: '17px', fontWeight: 800, color: 'var(--color-accent)' }}>מקלטים</span>
        </div>
        {regularShelters.map(s => (
          <div key={s.id} style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '12px 14px', borderBottom: '1px solid var(--color-border)',
          }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--color-accent)', width: '28px', textAlign: 'center', flexShrink: 0 }}>
              {s.number}
            </span>
            <span style={{ fontSize: '13px', fontWeight: 700, flex: 1 }}>{s.name}</span>
            <button onClick={() => handleImageClick(s.name)} style={{
              background: 'none', border: 'none', color: s.imageUrl ? 'var(--color-success)' : 'var(--color-text-secondary)', fontSize: '20px', cursor: 'pointer', padding: '0 12px 0 4px', lineHeight: 1,
            }}>📷</button>
            <button onClick={() => removeShelter(s.id)} style={{
              background: 'none', border: 'none', color: 'var(--color-danger)', fontSize: '18px', cursor: 'pointer', padding: '0 8px',
            }}>✕</button>
          </div>
        ))}
      </div>

      {/* Special statuses */}
      {specialStatuses.length > 0 && (
        <div style={{
          background: 'var(--color-bg-card)',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--color-border)',
          overflow: 'hidden',
          marginBottom: '16px',
        }}>
          <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--color-border)', background: 'rgba(232, 197, 77, 0.05)' }}>
            <span style={{ fontSize: '17px', fontWeight: 800, color: '#E8C54D' }}>סטטוסים אישיים</span>
          </div>
          {specialStatuses.map(s => (
            <div key={s.id} style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '12px 14px', borderBottom: '1px solid var(--color-border)',
            }}>
              <span style={{ fontSize: '13px', fontWeight: 700, flex: 1 }}>{s.name}</span>
              <button onClick={() => handleImageClick(s.name)} style={{
                background: 'none', border: 'none', color: s.imageUrl ? 'var(--color-success)' : 'var(--color-text-secondary)', fontSize: '20px', cursor: 'pointer', padding: '0 12px 0 4px', lineHeight: 1,
              }}>📷</button>
              <button onClick={() => removeShelter(s.id)} style={{
                background: 'none', border: 'none', color: 'var(--color-danger)', fontSize: '18px', cursor: 'pointer', padding: '0 8px',
              }}>✕</button>
            </div>
          ))}
        </div>
      )}

      {/* Add shelter manually */}
      <div style={{
        background: 'var(--color-bg-card)',
        borderRadius: 'var(--radius)',
        border: '1px solid var(--color-border)',
        padding: '14px',
        marginBottom: '16px',
      }}>
        <p style={{ fontSize: '12px', fontWeight: 800, color: 'var(--color-accent)', marginBottom: '10px' }}>הוספה ידנית</p>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="text"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="שם מקלט..."
            style={{
              flex: 1, minWidth: '120px', padding: '8px 10px', borderRadius: '6px',
              border: '1px solid var(--color-border)', background: 'var(--color-bg-secondary)',
              color: 'var(--color-text)', fontSize: '12px', outline: 'none',
            }}
          />
          {!newIsSpecial && (
            <input
              type="number"
              value={newNumber}
              onChange={e => setNewNumber(e.target.value)}
              placeholder="מספר"
              style={{
                width: '60px', padding: '8px 10px', borderRadius: '6px',
                border: '1px solid var(--color-border)', background: 'var(--color-bg-secondary)',
                color: 'var(--color-text)', fontSize: '12px', outline: 'none',
              }}
            />
          )}
          <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--color-text-secondary)' }}>
            <input type="checkbox" checked={newIsSpecial} onChange={e => setNewIsSpecial(e.target.checked)} />
            סטטוס אישי
          </label>
          <button onClick={addShelter} style={{
            background: 'var(--color-success)', color: '#fff', border: 'none',
            borderRadius: '6px', padding: '8px 16px', fontSize: '12px', fontWeight: 700, cursor: 'pointer',
          }}>+</button>
        </div>
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
      <input ref={imageInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
    </PageLayout>
  )
}
