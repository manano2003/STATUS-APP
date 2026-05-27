import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useStore } from '../data/store'
import { supabase } from '../data/supabase'
import { loadSchoolsFromDB, saveSchoolsToDB, getSchoolsFromCache } from '../data/sourceData'
import PageLayout from '../components/PageLayout'

interface School {
  id: string
  name: string
  councilId: string
}

const councilNames: Record<string, string> = {
  'mateh-yehuda': 'מטה יהודה',
}

export default function SchoolsList() {
  const { councilId } = useParams<{ councilId: string }>()
  const navigate = useNavigate()
  const { currentUser } = useStore()
  const [schools, setSchools] = useState<School[]>(() => {
    const cached = getSchoolsFromCache()
    return cached.length > 0 ? cached : [{ id: 'hartuv', name: 'הרטוב', councilId: 'mateh-yehuda' }]
  })

  useEffect(() => {
    loadSchoolsFromDB().then(s => { if (s.length > 0) setSchools(s) })
    const channel = supabase.channel('schools-list')
      .on('postgres_changes', { event: '*', schema: 'status', table: 'schools' }, () => {
        loadSchoolsFromDB().then(s => { if (s.length > 0) setSchools(s) })
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])
  const [showAdd, setShowAdd] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [newName, setNewName] = useState('')
  const [logos, setLogos] = useState<Record<string, string>>(() => {
    try { return JSON.parse(localStorage.getItem('school_logos') || '{}') } catch { return {} }
  })
  const imageInputRef = useRef<HTMLInputElement>(null)
  const [uploadingId, setUploadingId] = useState<string | null>(null)

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
      localStorage.setItem('school_logos', JSON.stringify(newLogos))
    }
    reader.readAsDataURL(file)
    e.target.value = ''
    setUploadingId(null)
  }

  const councilSchools = schools.filter(s => s.councilId === councilId)
  const councilName = councilId ? councilNames[councilId] || councilId : ''

  const addSchool = () => {
    if (!newName.trim() || !councilId) return
    const id = newName.trim().replace(/\s+/g, '-').replace(/[/"]/g, '').toLowerCase()
    const updated = [...schools, { id, name: newName.trim(), councilId }]
    setSchools(updated)
    saveSchoolsToDB(updated, currentUser?.id || '')
    setNewName('')
    setShowAdd(false)
  }

  return (
    <PageLayout title="בתי ספר" subtitle={councilName} backTo="/schools/councils">
      {/* Permissions button */}
      <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '16px' }}>
        <button
          onClick={() => navigate(`/schools/council/${councilId}/permissions`)}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: 'rgba(77, 166, 232, 0.1)',
            border: '1px solid var(--color-accent)',
            borderRadius: 'var(--radius-sm)',
            padding: '8px 16px',
            fontSize: '13px', fontWeight: 700,
            color: 'var(--color-accent)',
            cursor: 'pointer',
          }}
        >
          🔒 הרשאות מועצה
        </button>
      </div>

      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '16px',
        justifyContent: 'center',
      }}>
        {councilSchools.map(school => (
          <div key={school.id} style={{ position: 'relative' }}>
            <button
              onClick={(e) => handleImageClick(e, school.id)}
              style={{
                position: 'absolute', top: 6, right: 6, zIndex: 2,
                background: 'rgba(77, 166, 232, 0.2)', border: '1px solid var(--color-accent)',
                borderRadius: '50%', width: '28px', height: '28px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', fontSize: '13px', color: 'var(--color-accent)', lineHeight: 1, padding: 0,
              }}
            >📷</button>
            <button
              onClick={() => {
                // סגל חינוכי → כיתות, מנהלת/מזכירות/אדמין → מזכירות
                const isAdmin = currentUser?.roles?.includes('ADMIN')
                let schoolUsers: any[] = []
                try { schoolUsers = JSON.parse(localStorage.getItem(`school_users_${school.id}`) || '[]') } catch {}
                const me = schoolUsers.find((u: any) => u.email === currentUser?.email || u.phone === currentUser?.phone)
                const schoolRoles: string[] = me?.roles || []
                const isManagerOrSecretary = schoolRoles.includes('מנהלת') || schoolRoles.includes('מזכירות')
                if (isAdmin || isManagerOrSecretary) {
                  navigate(`/schools/${school.id}/management`)
                } else {
                  navigate(`/schools/${school.id}/classes`)
                }
              }}
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
              {logos[school.id] ? (
                <img src={logos[school.id]} alt={school.name} style={{
                  width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover',
                  display: 'block', margin: '0 auto 12px',
                }} />
              ) : (
                <span style={{ fontSize: '48px', display: 'block', marginBottom: '12px' }}>🏫</span>
              )}
              <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-text)' }}>{school.name}</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                const link = `${window.location.origin}/STATUS-APP/schools/${school.id}`
                navigator.clipboard.writeText(link)
                setCopiedId(school.id)
                setTimeout(() => setCopiedId(null), 2000)
              }}
              style={{
                display: 'block', width: '160px', marginTop: '0', padding: '8px',
                background: copiedId === school.id ? 'rgba(77, 232, 138, 0.15)' : 'rgba(77, 166, 232, 0.1)',
                border: `1px solid ${copiedId === school.id ? 'var(--color-success)' : 'var(--color-border)'}`,
                borderTop: 'none',
                borderRadius: '0 0 var(--radius) var(--radius)',
                color: copiedId === school.id ? 'var(--color-success)' : 'var(--color-accent)',
                fontSize: '12px', fontWeight: 700, cursor: 'pointer', textAlign: 'center',
              }}
            >{copiedId === school.id ? 'הלינק הועתק!' : 'העתק לינק'}</button>
          </div>
        ))}
      </div>

      {!showAdd ? (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '24px' }}>
          <button
            onClick={() => setShowAdd(true)}
            style={{
              background: 'var(--color-accent)',
              color: '#fff',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              padding: '12px 32px',
              fontSize: '15px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            + הוסף בית ספר
          </button>
        </div>
      ) : (
        <div style={{
          marginTop: '24px',
          background: 'var(--color-bg-card)',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--color-accent)',
          padding: '20px',
          maxWidth: '320px',
          margin: '24px auto 0',
        }}>
          <input
            type="text"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') addSchool() }}
            placeholder="שם בית הספר"
            autoFocus
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
              boxSizing: 'border-box',
            }}
          />
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button onClick={addSchool} style={{
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
