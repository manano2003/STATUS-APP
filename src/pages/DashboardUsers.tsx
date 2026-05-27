import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../data/store'
import PageLayout from '../components/PageLayout'
import * as XLSX from 'xlsx'

export default function DashboardUsers() {
  const navigate = useNavigate()
  const { users, addUser, deleteUser } = useStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [search, setSearch] = useState('')

  const residentUsers = users.filter(u => !u.isGuest)
  const guestUsers = users.filter(u => u.isGuest)

  const filteredResidents = residentUsers.filter(u => {
    if (!search.trim()) return true
    const q = search.trim().toLowerCase()
    return u.fullName.toLowerCase().includes(q) || u.houseNumber.includes(q)
  })

  const filteredGuests = guestUsers.filter(u => {
    if (!search.trim()) return true
    const q = search.trim().toLowerCase()
    return u.fullName.toLowerCase().includes(q) || u.houseNumber.includes(q)
  })

  const handleDownloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      ['שם מלא', 'מספר טלפון', 'מייל', 'מספר בית', 'נפשות בבית'],
      ['', '', '', '', ''],
    ])
    ws['!cols'] = [{ wch: 20 }, { wch: 15 }, { wch: 25 }, { wch: 12 }, { wch: 12 }]
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'תושבים')
    XLSX.writeFile(wb, 'תבנית_תושבים.xlsx')
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
      // Skip header row
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i]
        if (!row || !row[0]) continue
        const fullName = String(row[0] || '').trim()
        const phone = String(row[1] || '').trim().replace(/\D/g, '')
        const email = String(row[2] || '').trim()
        const houseNumber = String(row[3] || '').trim()
        const residents = parseInt(String(row[4] || '1')) || 1
        const roles = ['USR']
        if (!fullName) continue
        addUser({
          id: Date.now().toString() + '-' + i,
          email,
          fullName,
          phone,
          city: '',
          street: '',
          houseNumber,
          residents,
          roles,
        })
      }
    }
    reader.readAsArrayBuffer(file)
    e.target.value = ''
  }

  return (
    <PageLayout title="👥 רשומים במערכת" subtitle={`${residentUsers.length} תושבים | ${guestUsers.length} אורחים`} backTo="/dashboard/sources">

      <input
        type="text"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="חיפוש לפי שם או מספר בית..."
        style={{
          width: '100%',
          padding: '10px 14px',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--color-border)',
          background: 'var(--color-bg-secondary)',
          color: 'var(--color-text)',
          fontSize: '14px',
          marginBottom: '12px',
          outline: 'none',
        }}
      />

      {/* Residents table */}
      <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-accent)', marginBottom: '8px' }}>
        תושב/ת ({filteredResidents.length})
      </h3>
      <div style={{
        background: 'var(--color-bg-card)',
        borderRadius: 'var(--radius)',
        border: '1px solid var(--color-border)',
        overflow: 'hidden',
        marginBottom: '24px',
      }}>
        {filteredResidents.length === 0 ? (
          <p style={{ padding: '20px', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '13px' }}>
            אין תושבים רשומים
          </p>
        ) : (
          <>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1.5fr 1fr 50px 50px 1fr 36px',
              padding: '10px 12px',
              borderBottom: '1px solid var(--color-border)',
              fontSize: '11px', fontWeight: 700, color: 'var(--color-text-secondary)',
            }}>
              <span>שם מלא</span>
              <span>טלפון</span>
              <span style={{ textAlign: 'center' }}>בית</span>
              <span style={{ textAlign: 'center' }}>נפשות</span>
              <span style={{ textAlign: 'center' }}>הרשאות</span>
              <span></span>
            </div>
            {filteredResidents.map(user => (
              <div key={user.id} onClick={() => navigate(`/dashboard/user/${user.id}`)} style={{
                display: 'grid', gridTemplateColumns: '1.5fr 1fr 50px 50px 1fr 36px',
                padding: '10px 12px', borderBottom: '1px solid var(--color-border)',
                fontSize: '12px', cursor: 'pointer', transition: 'background 0.15s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(77, 166, 232, 0.05)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <span style={{ fontWeight: 600, color: 'var(--color-accent)' }}>{user.fullName}</span>
                <span style={{ direction: 'ltr', textAlign: 'right', fontSize: '11px' }}>{user.phone ? `+972${user.phone}` : '—'}</span>
                <span style={{ textAlign: 'center' }}>{user.houseNumber || '—'}</span>
                <span style={{ textAlign: 'center' }}>{user.residents}</span>
                <span style={{ textAlign: 'center', fontSize: '10px', color: 'var(--color-text-secondary)' }}>
                  {user.roles.filter(r => r !== 'USR').length > 0 ? user.roles.filter(r => r !== 'USR').join(', ') : 'משתמש'}
                </span>
                <button onClick={(e) => { e.stopPropagation(); if (confirm(`למחוק את ${user.fullName}?`)) deleteUser(user.id) }}
                  style={{ background: 'none', border: 'none', color: 'var(--color-danger)', fontSize: '16px', cursor: 'pointer', padding: '0', lineHeight: 1 }}>✕</button>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Guests table */}
      <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-warning)', marginBottom: '8px' }}>
        אורח/ת ({filteredGuests.length})
      </h3>
      <div style={{
        background: 'var(--color-bg-card)',
        borderRadius: 'var(--radius)',
        border: '1px solid rgba(232, 197, 77, 0.3)',
        overflow: 'hidden',
      }}>
        {filteredGuests.length === 0 ? (
          <p style={{ padding: '20px', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '13px' }}>
            אין אורחים רשומים
          </p>
        ) : (
          <>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1.5fr 1fr 50px 36px',
              padding: '10px 12px',
              borderBottom: '1px solid var(--color-border)',
              fontSize: '11px', fontWeight: 700, color: 'var(--color-text-secondary)',
            }}>
              <span>שם מלא</span>
              <span>טלפון</span>
              <span style={{ textAlign: 'center' }}>נפשות</span>
              <span></span>
            </div>
            {filteredGuests.map(user => (
              <div key={user.id} onClick={() => navigate(`/dashboard/user/${user.id}`)} style={{
                display: 'grid', gridTemplateColumns: '1.5fr 1fr 50px 36px',
                padding: '10px 12px', borderBottom: '1px solid var(--color-border)',
                fontSize: '12px', cursor: 'pointer', transition: 'background 0.15s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(232, 197, 77, 0.05)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <span style={{ fontWeight: 600, color: 'var(--color-warning)' }}>{user.fullName}</span>
                <span style={{ direction: 'ltr', textAlign: 'right', fontSize: '11px' }}>{user.phone ? `+972${user.phone}` : '—'}</span>
                <span style={{ textAlign: 'center' }}>{user.residents}</span>
                <button onClick={(e) => { e.stopPropagation(); if (confirm(`למחוק את ${user.fullName}?`)) deleteUser(user.id) }}
                  style={{ background: 'none', border: 'none', color: 'var(--color-danger)', fontSize: '16px', cursor: 'pointer', padding: '0', lineHeight: 1 }}>✕</button>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Excel buttons */}
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '24px' }}>
        <button
          onClick={() => fileInputRef.current?.click()}
          style={{
            background: 'var(--color-accent)',
            color: '#fff',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            padding: '12px 24px',
            fontSize: '14px',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          העלאת אקסל
        </button>
        <button
          onClick={handleDownloadTemplate}
          style={{
            background: 'transparent',
            color: 'var(--color-accent)',
            border: '1px solid var(--color-accent)',
            borderRadius: 'var(--radius-sm)',
            padding: '12px 24px',
            fontSize: '14px',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          הורד אקסל
        </button>
        <button
          onClick={() => navigate('/dashboard/permissions')}
          style={{
            background: 'transparent',
            color: 'var(--color-warning)',
            border: '1px solid var(--color-warning)',
            borderRadius: 'var(--radius-sm)',
            padding: '12px 24px',
            fontSize: '14px',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          הרשאות
        </button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        style={{ display: 'none' }}
        onChange={handleUploadExcel}
      />
    </PageLayout>
  )
}
