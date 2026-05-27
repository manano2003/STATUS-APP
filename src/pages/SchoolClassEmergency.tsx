import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useStore } from '../data/store'
import { saveSchoolEmergencyToDB, getSchoolEmergencyFromCache } from '../data/sourceData'
import SchoolHome from './SchoolHome'

export default function SchoolClassEmergency() {
  const { schoolId, className } = useParams<{ schoolId: string; className: string }>()
  const navigate = useNavigate()
  const { currentUser } = useStore()
  const decodedClassName = className ? decodeURIComponent(className) : ''

  const [currentStatus, setCurrentStatus] = useState<string>('none')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!schoolId) return
    const cache = getSchoolEmergencyFromCache(schoolId)
    if (cache[decodedClassName]) setCurrentStatus(cache[decodedClassName])
  }, [schoolId, decodedClassName])

  const handleSelect = async (status: string) => {
    if (!schoolId) return
    await saveSchoolEmergencyToDB(schoolId, decodedClassName, status, currentUser?.id || '')
    setCurrentStatus(status)
    setSaved(true)
    setTimeout(() => navigate(`/schools/${schoolId}/classes?selected=${encodeURIComponent(decodedClassName)}`), 1500)
  }

  return (
    <SchoolHome backTo={`/schools/${schoolId}/classes?selected=${encodeURIComponent(decodedClassName)}`} content={
      <>
        <p style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-accent)', textAlign: 'center', marginBottom: '4px' }}>
          חירום — כיתה {decodedClassName}
        </p>
        <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', textAlign: 'center', marginBottom: '24px' }}>
          מה מצב הכיתה?
        </p>

        {saved && (
          <div style={{
            background: currentStatus === 'protected' ? 'rgba(77, 232, 138, 0.15)' : 'rgba(232, 77, 77, 0.15)',
            border: `1px solid ${currentStatus === 'protected' ? 'var(--color-success)' : 'var(--color-danger)'}`,
            borderRadius: 'var(--radius)', padding: '12px', textAlign: 'center',
            marginBottom: '16px', fontSize: '14px', fontWeight: 700,
            color: currentStatus === 'protected' ? 'var(--color-success)' : 'var(--color-danger)',
          }}>
            {currentStatus === 'protected' ? 'הכיתה סומנה כמוגנת!' : 'הכיתה סומנה כלא מוגנת!'}
          </div>
        )}

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <button
            onClick={() => handleSelect('protected')}
            style={{
              width: '140px', padding: '32px 16px',
              background: currentStatus === 'protected' ? 'rgba(77, 232, 138, 0.15)' : 'var(--color-bg-card)',
              border: `2px solid ${currentStatus === 'protected' ? 'var(--color-success)' : 'var(--color-border)'}`,
              borderRadius: 'var(--radius)',
              cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s ease',
              boxShadow: currentStatus === 'protected' ? '0 0 15px rgba(77, 232, 138, 0.3)' : 'none',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-success)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = currentStatus === 'protected' ? 'var(--color-success)' : 'var(--color-border)'; e.currentTarget.style.transform = 'translateY(0)' }}
          >
            <span style={{ fontSize: '48px', display: 'block', marginBottom: '10px' }}>🛡️</span>
            <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-success)' }}>מוגנים</span>
          </button>
          <button
            onClick={() => handleSelect('not_protected')}
            style={{
              width: '140px', padding: '32px 16px',
              background: currentStatus === 'not_protected' ? 'rgba(232, 77, 77, 0.15)' : 'var(--color-bg-card)',
              border: `2px solid ${currentStatus === 'not_protected' ? 'var(--color-danger)' : 'var(--color-border)'}`,
              borderRadius: 'var(--radius)',
              cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s ease',
              boxShadow: currentStatus === 'not_protected' ? '0 0 15px rgba(232, 77, 77, 0.3)' : 'none',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-danger)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = currentStatus === 'not_protected' ? 'var(--color-danger)' : 'var(--color-border)'; e.currentTarget.style.transform = 'translateY(0)' }}
          >
            <span style={{ fontSize: '48px', display: 'block', marginBottom: '10px' }}>⚠️</span>
            <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-danger)' }}>לא מוגנים</span>
          </button>
        </div>

      </>
    } />
  )
}
