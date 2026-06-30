import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../data/supabase'
import PageLayout from '../components/PageLayout'

const LOGOS_KEY = 'council_logos'

function loadLogos(): Record<string, string> {
  try { return JSON.parse(localStorage.getItem(LOGOS_KEY) || '{}') } catch { return {} }
}

const councils = [
  { id: 'mateh-yehuda', name: 'מטה יהודה', icon: '🏛️' },
]

export default function SchoolsCouncils() {
  const navigate = useNavigate()
  const [logos, setLogos] = useState<Record<string, string>>(loadLogos)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadingId, setUploadingId] = useState<string | null>(null)

  useEffect(() => {
    supabase.from('app_settings').select('key,value').like('key', 'council_logo_%').then(({ data }) => {
      if (data && data.length > 0) {
        const dbLogos: Record<string, string> = {}
        data.forEach((r: any) => { dbLogos[r.key.replace('council_logo_', '')] = r.value })
        const merged = { ...logos, ...dbLogos }
        setLogos(merged)
        localStorage.setItem(LOGOS_KEY, JSON.stringify(merged))
      }
    })
  }, [])

  const handleImageClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    setUploadingId(id)
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !uploadingId) return
    const reader = new FileReader()
    reader.onload = (evt) => {
      const dataUrl = evt.target?.result as string
      const newLogos = { ...logos, [uploadingId]: dataUrl }
      setLogos(newLogos)
      localStorage.setItem(LOGOS_KEY, JSON.stringify(newLogos))
      supabase.from('app_settings').upsert({ key: `council_logo_${uploadingId}`, value: dataUrl }).then(() => {})
    }
    reader.readAsDataURL(file)
    e.target.value = ''
    setUploadingId(null)
  }

  return (
    <PageLayout title="מועצות" backTo="/communities">

      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '16px',
        justifyContent: 'center',
      }}>
        {councils.map(c => (
          <div key={c.id} style={{ position: 'relative' }}>
            <button
              onClick={(e) => handleImageClick(e, c.id)}
              style={{
                position: 'absolute', top: 6, right: 6, zIndex: 2,
                background: 'rgba(77, 166, 232, 0.2)', border: '1px solid var(--color-accent)',
                borderRadius: '50%', width: '28px', height: '28px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', fontSize: '13px', color: 'var(--color-accent)', lineHeight: 1, padding: 0,
              }}
            >📷</button>
            <button
              onClick={() => navigate(`/schools/council/${c.id}/categories`)}
              style={{
                background: 'var(--color-bg-card)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius) var(--radius) 0 0',
                width: '160px',
                padding: '32px 16px',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--color-accent)'
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = 'var(--shadow-glow)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(77, 166, 232, 0.2)'
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              {logos[c.id] ? (
                <img src={logos[c.id]} alt={c.name} style={{
                  width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover',
                  display: 'block', margin: '0 auto 12px',
                }} />
              ) : (
                <span style={{ fontSize: '48px', display: 'block', marginBottom: '12px' }}>{c.icon}</span>
              )}
              <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-text)' }}>{c.name}</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                const link = `${window.location.origin}/STATUS-APP/schools/council/${c.id}`
                navigator.clipboard.writeText(link)
                setCopiedId(c.id)
                setTimeout(() => setCopiedId(null), 2000)
              }}
              style={{
                display: 'block', width: '160px', padding: '8px',
                background: copiedId === c.id ? 'rgba(77, 232, 138, 0.15)' : 'rgba(77, 166, 232, 0.1)',
                border: `1px solid ${copiedId === c.id ? 'var(--color-success)' : 'var(--color-border)'}`,
                borderTop: 'none',
                borderRadius: '0 0 var(--radius) var(--radius)',
                color: copiedId === c.id ? 'var(--color-success)' : 'var(--color-accent)',
                fontSize: '12px', fontWeight: 700, cursor: 'pointer', textAlign: 'center',
              }}
            >{copiedId === c.id ? 'הלינק הועתק!' : 'העתק לינק'}</button>
          </div>
        ))}
      </div>
      <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
    </PageLayout>
  )
}
