import { useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import PageLayout from '../components/PageLayout'

interface Camp {
  id: string
  name: string
  councilId: string
}

const STORAGE_KEY = 'status_camps'

function loadCamps(): Camp[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return JSON.parse(saved)
  } catch {}
  return []
}

function saveCamps(camps: Camp[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(camps))
}

const councilNames: Record<string, string> = {
  'mateh-yehuda': 'מטה יהודה',
}

export default function CouncilCamps() {
  const { councilId } = useParams<{ councilId: string }>()
  const [camps, setCamps] = useState<Camp[]>(loadCamps)
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [logos, setLogos] = useState<Record<string, string>>(() => {
    try { return JSON.parse(localStorage.getItem('camp_logos') || '{}') } catch { return {} }
  })
  const imageInputRef = useRef<HTMLInputElement>(null)
  const [uploadingId, setUploadingId] = useState<string | null>(null)

  const councilCamps = camps.filter(c => c.councilId === councilId)
  const councilName = councilId ? councilNames[councilId] || councilId : ''

  const handleImageClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    setUploadingId(id)
    imageInputRef.current?.click()
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !uploadingId) return
    const reader = new FileReader()
    reader.onload = (evt) => {
      const dataUrl = evt.target?.result as string
      const newLogos = { ...logos, [uploadingId]: dataUrl }
      setLogos(newLogos)
      localStorage.setItem('camp_logos', JSON.stringify(newLogos))
    }
    reader.readAsDataURL(file)
    e.target.value = ''
    setUploadingId(null)
  }

  const addCamp = () => {
    if (!newName.trim() || !councilId) return
    const id = newName.trim().replace(/\s+/g, '-').replace(/[/"]/g, '').toLowerCase()
    const updated = [...camps, { id, name: newName.trim(), councilId }]
    setCamps(updated)
    saveCamps(updated)
    setNewName('')
    setShowAdd(false)
  }

  return (
    <PageLayout title="קייטנות" subtitle={councilName} backTo={`/schools/council/${councilId}`}>
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center',
      }}>
        {councilCamps.map(camp => (
          <div key={camp.id} style={{ position: 'relative' }}>
            <button
              onClick={(e) => handleImageClick(e, camp.id)}
              style={{
                position: 'absolute', top: 6, right: 6, zIndex: 2,
                background: 'rgba(77, 166, 232, 0.2)', border: '1px solid var(--color-accent)',
                borderRadius: '50%', width: '28px', height: '28px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', fontSize: '13px', color: 'var(--color-accent)', lineHeight: 1, padding: 0,
              }}
            >📷</button>
            <button
              onClick={() => alert('אזור בבניה')}
              style={{
                background: 'var(--color-bg-card)', border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius) var(--radius) 0 0', width: '160px', padding: '32px 16px',
                cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-accent)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-glow)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(77, 166, 232, 0.2)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
            >
              {logos[camp.id] ? (
                <img src={logos[camp.id]} alt={camp.name} style={{
                  width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover',
                  display: 'block', margin: '0 auto 12px',
                }} />
              ) : (
                <span style={{ fontSize: '48px', display: 'block', marginBottom: '12px' }}>🏕️</span>
              )}
              <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-text)' }}>{camp.name}</span>
            </button>
          </div>
        ))}
      </div>

      {!showAdd ? (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '40px' }}>
          <button
            onClick={() => setShowAdd(true)}
            style={{
              background: 'var(--color-accent)', color: '#fff', border: 'none',
              borderRadius: 'var(--radius-sm)', padding: '12px 32px',
              fontSize: '15px', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-family)',
            }}
          >
            + הוסף קייטנה
          </button>
        </div>
      ) : (
        <div style={{
          marginTop: '24px', background: 'var(--color-bg-card)',
          borderRadius: 'var(--radius)', border: '1px solid var(--color-accent)',
          padding: '20px', maxWidth: '320px', margin: '24px auto 0',
        }}>
          <input
            type="text" value={newName} onChange={e => setNewName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') addCamp() }}
            placeholder="שם הקייטנה" autoFocus
            style={{
              width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border)', background: 'var(--color-bg-secondary)',
              color: 'var(--color-text)', fontSize: '14px', marginBottom: '12px', outline: 'none', boxSizing: 'border-box',
            }}
          />
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button onClick={addCamp} style={{
              background: 'var(--color-accent)', color: '#fff', border: 'none',
              borderRadius: 'var(--radius-sm)', padding: '10px 24px', fontSize: '14px', fontWeight: 700, cursor: 'pointer',
            }}>הוסף</button>
            <button onClick={() => { setShowAdd(false); setNewName('') }} style={{
              background: 'transparent', color: 'var(--color-text-secondary)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)', padding: '10px 24px', fontSize: '14px', fontWeight: 700, cursor: 'pointer',
            }}>ביטול</button>
          </div>
        </div>
      )}
      <input ref={imageInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageChange} />
    </PageLayout>
  )
}
