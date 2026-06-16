import { useState, useEffect } from 'react'
import { onPendingChange } from '../data/outbox'

export let showSaveStatus: (status: 'saving' | 'saved' | 'failed', message?: string) => void = () => {}

export default function SaveIndicator() {
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'failed'>('idle')
  const [message, setMessage] = useState('')
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    showSaveStatus = (s, msg) => {
      setStatus(s)
      setMessage(msg || '')
      if (s === 'saved') setTimeout(() => setStatus('idle'), 2000)
    }
    return onPendingChange(setPendingCount)
  }, [])

  if (status === 'idle' && pendingCount === 0) return null

  return (
    <div style={{
      position: 'fixed', bottom: 70, left: '50%', transform: 'translateX(-50%)',
      zIndex: 9998, display: 'flex', gap: '8px', alignItems: 'center',
    }}>
      {status === 'saving' && (
        <div style={{
          background: 'rgba(77, 166, 232, 0.9)', color: '#fff',
          padding: '8px 16px', borderRadius: '20px',
          fontSize: '13px', fontWeight: 700, whiteSpace: 'nowrap',
        }}>
          שומר...
        </div>
      )}
      {status === 'saved' && (
        <div style={{
          background: 'rgba(77, 232, 138, 0.9)', color: '#fff',
          padding: '8px 16px', borderRadius: '20px',
          fontSize: '13px', fontWeight: 700, whiteSpace: 'nowrap',
        }}>
          נשמר ✓
        </div>
      )}
      {status === 'failed' && (
        <div style={{
          background: 'rgba(232, 77, 77, 0.9)', color: '#fff',
          padding: '8px 16px', borderRadius: '20px',
          fontSize: '13px', fontWeight: 700, whiteSpace: 'nowrap',
        }}>
          שמירה נכשלה {message ? `— ${message}` : ''}
        </div>
      )}
      {pendingCount > 0 && (
        <div style={{
          background: 'rgba(232, 197, 77, 0.9)', color: '#000',
          padding: '8px 16px', borderRadius: '20px',
          fontSize: '13px', fontWeight: 700, whiteSpace: 'nowrap',
        }}>
          {pendingCount} בהמתנה
        </div>
      )}
    </div>
  )
}
