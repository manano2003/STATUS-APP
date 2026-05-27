import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useStore } from '../data/store'
import { supabase } from '../data/supabase'
import SchoolHome from './SchoolHome'

interface BackupClass {
  id: number
  school_id: string
  class_name: string
  students: string[]
  deleted_at: string
}

interface BackupUser {
  id: number
  school_id: string
  user_id: string
  full_name: string
  phone: string
  email: string
  class_name: string
  deleted_at: string
}

export default function SchoolBackup() {
  const { schoolId } = useParams<{ schoolId: string }>()
  const { currentUser } = useStore()
  const [tab, setTab] = useState<'classes' | 'users'>('classes')
  const [backupClasses, setBackupClasses] = useState<BackupClass[]>([])
  const [backupUsers, setBackupUsers] = useState<BackupUser[]>([])
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  const loadBackups = async () => {
    if (!schoolId) return
    const { data: classes } = await supabase.from('backup_school_classes').select('*').eq('school_id', schoolId).order('deleted_at', { ascending: false })
    if (classes) setBackupClasses(classes)
    const { data: users } = await supabase.from('backup_school_users').select('*').eq('school_id', schoolId).order('deleted_at', { ascending: false })
    if (users) setBackupUsers(users)
  }

  useEffect(() => { loadBackups() }, [schoolId])

  const restoreClass = async (backupId: number) => {
    setLoading(true)
    await supabase.rpc('restore_school_class', { caller_id: currentUser?.id || '', p_backup_id: backupId })
    await loadBackups()
    setLoading(false)
  }

  const permanentDeleteClass = async (backupId: number) => {
    setLoading(true)
    await supabase.rpc('permanent_delete_school_class', { caller_id: currentUser?.id || '', p_backup_id: backupId })
    setConfirmDelete(null)
    await loadBackups()
    setLoading(false)
  }

  const restoreUser = async (backupId: number) => {
    setLoading(true)
    await supabase.rpc('restore_school_user', { caller_id: currentUser?.id || '', p_backup_id: backupId })
    await loadBackups()
    setLoading(false)
  }

  const permanentDeleteUser = async (backupId: number) => {
    setLoading(true)
    await supabase.rpc('permanent_delete_school_user', { caller_id: currentUser?.id || '', p_backup_id: backupId })
    setConfirmDelete(null)
    await loadBackups()
    setLoading(false)
  }

  const formatDate = (d: string) => new Date(d).toLocaleDateString('he-IL', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

  return (
    <SchoolHome backTo={`/schools/${schoolId}/management`} content={
      <>
        <p style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-accent)', textAlign: 'center', marginBottom: '16px' }}>
          גיבוי ושחזור
        </p>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', justifyContent: 'center' }}>
          {[
            { id: 'classes' as const, label: 'כיתות ותלמידים', icon: '👦', count: backupClasses.length },
            { id: 'users' as const, label: 'משתמשים', icon: '👥', count: backupUsers.length },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                flex: 1, padding: '12px', background: tab === t.id ? 'rgba(77, 166, 232, 0.15)' : 'var(--color-bg-card)',
                border: `1px solid ${tab === t.id ? 'var(--color-accent)' : 'var(--color-border)'}`,
                borderRadius: 'var(--radius)', cursor: 'pointer', textAlign: 'center',
              }}
            >
              <span style={{ fontSize: '20px', display: 'block', marginBottom: '4px' }}>{t.icon}</span>
              <span style={{ fontSize: '12px', fontWeight: 700, color: tab === t.id ? 'var(--color-accent)' : 'var(--color-text-secondary)' }}>
                {t.label} ({t.count})
              </span>
            </button>
          ))}
        </div>

        {/* Classes backup */}
        {tab === 'classes' && (
          <div style={{ background: 'var(--color-bg-card)', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
            {backupClasses.length === 0 ? (
              <p style={{ padding: '20px', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '13px' }}>אין כיתות בגיבוי</p>
            ) : backupClasses.map(bc => (
              <div key={bc.id} style={{ padding: '12px 14px', borderBottom: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <div>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text)' }}>כיתה {bc.class_name}</span>
                    <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginRight: '8px' }}>{bc.students?.length || 0} תלמידים</span>
                  </div>
                  <span style={{ fontSize: '10px', color: 'var(--color-text-secondary)' }}>{formatDate(bc.deleted_at)}</span>
                </div>
                {confirmDelete === bc.id ? (
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    <button onClick={() => permanentDeleteClass(bc.id)} disabled={loading} style={{
                      background: 'var(--color-danger)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)',
                      padding: '6px 16px', fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                    }}>מחק לצמיתות</button>
                    <button onClick={() => setConfirmDelete(null)} style={{
                      background: 'transparent', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-sm)', padding: '6px 16px', fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                    }}>ביטול</button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    <button onClick={() => restoreClass(bc.id)} disabled={loading} style={{
                      background: 'rgba(77, 232, 138, 0.15)', color: 'var(--color-success)', border: '1px solid var(--color-success)',
                      borderRadius: 'var(--radius-sm)', padding: '6px 16px', fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                    }}>שחזר</button>
                    <button onClick={() => setConfirmDelete(bc.id)} style={{
                      background: 'transparent', color: 'var(--color-danger)', border: '1px solid var(--color-danger)',
                      borderRadius: 'var(--radius-sm)', padding: '6px 16px', fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                    }}>מחק</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Users backup */}
        {tab === 'users' && (
          <div style={{ background: 'var(--color-bg-card)', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
            {backupUsers.length === 0 ? (
              <p style={{ padding: '20px', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '13px' }}>אין משתמשים בגיבוי</p>
            ) : backupUsers.map(bu => (
              <div key={bu.id} style={{ padding: '12px 14px', borderBottom: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <div>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text)' }}>{bu.full_name}</span>
                    <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginRight: '8px' }}>
                      {bu.class_name ? `כיתה ${bu.class_name}` : ''} {bu.phone ? `| ${bu.phone}` : ''}
                    </span>
                  </div>
                  <span style={{ fontSize: '10px', color: 'var(--color-text-secondary)' }}>{formatDate(bu.deleted_at)}</span>
                </div>
                {confirmDelete === bu.id + 10000 ? (
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    <button onClick={() => permanentDeleteUser(bu.id)} disabled={loading} style={{
                      background: 'var(--color-danger)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)',
                      padding: '6px 16px', fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                    }}>מחק לצמיתות</button>
                    <button onClick={() => setConfirmDelete(null)} style={{
                      background: 'transparent', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-sm)', padding: '6px 16px', fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                    }}>ביטול</button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    <button onClick={() => restoreUser(bu.id)} disabled={loading} style={{
                      background: 'rgba(77, 232, 138, 0.15)', color: 'var(--color-success)', border: '1px solid var(--color-success)',
                      borderRadius: 'var(--radius-sm)', padding: '6px 16px', fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                    }}>שחזר</button>
                    <button onClick={() => setConfirmDelete(bu.id + 10000)} style={{
                      background: 'transparent', color: 'var(--color-danger)', border: '1px solid var(--color-danger)',
                      borderRadius: 'var(--radius-sm)', padding: '6px 16px', fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                    }}>מחק</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </>
    } />
  )
}
