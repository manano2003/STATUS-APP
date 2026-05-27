import { useState, useEffect } from 'react'
import { loadResidents, type Resident } from '../data/residents'
import { useStore, EMERGENCY_STATUS_LABELS, EMERGENCY_STATUS_COLORS, type EmergencyStatusType } from '../data/store'
import PageLayout from '../components/PageLayout'
import ExportButtons from '../components/ExportButtons'

const PAGE_SIZE = 100

export default function DashboardEmergency() {
  const { emergencyStatuses, getResidentStatus, clearAllEmergencyStatuses } = useStore()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [filterStatus, setFilterStatus] = useState<EmergencyStatusType | 'pending' | null>(null)
  const [residents, setResidents] = useState<Resident[]>([])
  const [popupStatus, setPopupStatus] = useState<EmergencyStatusType | 'pending' | null>(null)

  useEffect(() => { loadResidents().then(setResidents) }, [])

  const formatTime = (ts: number) =>
    ts ? new Date(ts).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }) : '—'

  const pendingCount = residents.length - emergencyStatuses.length

  const typeCounts: { key: EmergencyStatusType | 'pending'; label: string; count: number; color: string }[] = [
    { key: 'pending', label: 'ללא סטטוס', count: pendingCount, color: 'var(--color-text-secondary)' },
    ...Object.keys(EMERGENCY_STATUS_LABELS).map(key => {
      const k = key as EmergencyStatusType
      return { key: k, label: EMERGENCY_STATUS_LABELS[k], count: emergencyStatuses.filter(s => s.status === k).length, color: EMERGENCY_STATUS_COLORS[k] }
    }),
  ]

  let filtered = search.trim()
    ? residents.filter(r => r.name.toLowerCase().includes(search.trim().toLowerCase()))
    : residents

  if (filterStatus === 'pending') {
    filtered = filtered.filter(r => !getResidentStatus(r.id))
  } else if (filterStatus) {
    filtered = filtered.filter(r => getResidentStatus(r.id)?.status === filterStatus)
  }

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const pageResidents = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  return (
    <PageLayout title="🚨 עדכון תושבים" subtitle={`${emergencyStatuses.length}/${residents.length} עודכנו`} backTo="/dashboard">
      <button
        onClick={() => { setFilterStatus(filterStatus === 'pending' ? null : 'pending'); setPage(0) }}
        style={{
          display: 'block', margin: '0 auto 12px', padding: '4px 12px', borderRadius: '10px',
          fontSize: '11px', fontWeight: 700, cursor: 'pointer', border: 'none',
          background: filterStatus === 'pending' ? 'rgba(255,255,255,0.15)' : 'var(--color-bg-card)',
          color: pendingCount > 0 ? 'var(--color-danger)' : 'var(--color-success)',
          outline: filterStatus === 'pending' ? '2px solid var(--color-text-secondary)' : 'none',
        }}
      >
        ללא סטטוס: {pendingCount}
      </button>

      {/* Status summary - single row */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', justifyContent: 'center' }}>
        {typeCounts.filter(t => t.key !== 'pending').map(t => (
          <button
            key={t.key}
            onClick={() => setPopupStatus(t.key)}
            style={{
              flex: 1, padding: '8px 4px', borderRadius: 'var(--radius-sm)', fontSize: '10px', fontWeight: 700,
              whiteSpace: 'nowrap', cursor: 'pointer', textAlign: 'center',
              border: filterStatus === t.key ? '2px solid ' + t.color : '1px solid ' + t.color + '40',
              background: t.color + '15',
              color: t.color,
            }}
          >
            <p style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 2px' }}>{t.count}</p>
            {t.label}
          </button>
        ))}
      </div>

      {/* Popup for status names */}
      {popupStatus && (() => {
        const isPending = popupStatus === 'pending'
        const title = isPending ? 'ללא סטטוס' : EMERGENCY_STATUS_LABELS[popupStatus as EmergencyStatusType]
        const color = isPending ? 'var(--color-text-secondary)' : EMERGENCY_STATUS_COLORS[popupStatus as EmergencyStatusType]
        const names = isPending
          ? residents.filter(r => !getResidentStatus(r.id)).map(r => r.name)
          : residents.filter(r => getResidentStatus(r.id)?.status === popupStatus).map(r => r.name)

        const generateText = () => {
          let text = `*${title}*\n${names.length} תושבים\n\n`
          names.forEach((n, i) => { text += `${i + 1}. ${n}\n` })
          return text
        }

        return (
          <div onClick={() => setPopupStatus(null)} style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 9999, padding: '20px',
          }}>
            <div onClick={e => e.stopPropagation()} style={{
              background: 'var(--color-bg-card)', borderRadius: 'var(--radius)',
              border: `2px solid ${color}`, overflow: 'hidden',
              width: '100%', maxWidth: '400px', maxHeight: '80vh', display: 'flex', flexDirection: 'column',
            }}>
              <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--color-border)', textAlign: 'center', background: 'var(--color-bg-card)', position: 'sticky', top: 0, zIndex: 1 }}>
                <span style={{ fontSize: '17px', fontWeight: 800, color }}>{title} ({names.length})</span>
                <button onClick={() => setPopupStatus(null)} style={{
                  position: 'absolute', top: 10, left: 10, background: 'none', border: 'none',
                  color: 'var(--color-text-secondary)', fontSize: '20px', cursor: 'pointer', lineHeight: 1,
                }}>✕</button>
              </div>
              <div style={{ overflowY: 'auto', flex: 1 }}>
                {names.length === 0 ? (
                  <p style={{ padding: '20px', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '13px' }}>אין תושבים</p>
                ) : names.map(name => (
                  <div key={name} style={{ padding: '10px 14px', borderBottom: '1px solid var(--color-border)', fontSize: '13px' }}>
                    {name}
                  </div>
                ))}
              </div>
              <div style={{ padding: '10px', borderTop: '1px solid var(--color-border)', display: 'flex', gap: '8px' }}>
                <button onClick={() => { window.open(`https://wa.me/?text=${encodeURIComponent(generateText())}`, '_blank') }} style={{
                  flex: 1, padding: '12px', borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-success)', background: 'rgba(77, 232, 138, 0.08)',
                  color: 'var(--color-success)', fontSize: '14px', fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontFamily: 'var(--font-family)',
                }}>
                  <span style={{ fontSize: '18px' }}>💬</span> WhatsApp
                </button>
                <button onClick={() => {
                  const text = generateText().replace(/\*/g, '')
                  const w = window.open('', '_blank')
                  if (w) { w.document.write(`<html dir="rtl"><head><title>${title}</title><style>body{font-family:Arial;padding:40px;direction:rtl}h1{color:#0A1628;border-bottom:2px solid #4DA6E8;padding-bottom:10px}pre{white-space:pre-wrap;font-family:Arial;font-size:14px;line-height:1.8}</style></head><body><h1>${title}</h1><pre>${text}</pre><script>window.print()<\/script></body></html>`); w.document.close() }
                }} style={{
                  flex: 1, padding: '12px', borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)', background: 'var(--color-bg-card)',
                  color: 'var(--color-accent)', fontSize: '14px', fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontFamily: 'var(--font-family)',
                }}>
                  <span style={{ fontSize: '18px' }}>🖨️</span> הדפסה
                </button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* Search */}
      <input
        type="text" value={search}
        onChange={e => { setSearch(e.target.value); setPage(0) }}
        placeholder="חיפוש תושב..."
        style={{
          width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--color-border)', background: 'var(--color-bg-secondary)',
          color: 'var(--color-text)', fontSize: '14px', outline: 'none', marginBottom: '12px',
        }}
        onFocus={e => e.target.style.borderColor = 'var(--color-accent)'}
        onBlur={e => e.target.style.borderColor = 'rgba(77, 166, 232, 0.2)'}
      />

      <div style={{
        background: 'var(--color-bg-card)', borderRadius: 'var(--radius)',
        border: '1px solid var(--color-border)', overflow: 'hidden',
      }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '1.5fr 1fr 65px 70px',
          padding: '10px 14px', borderBottom: '1px solid var(--color-border)',
          fontSize: '11px', fontWeight: 700, color: 'var(--color-text-secondary)',
        }}>
          <span>שם</span>
          <span>סטטוס</span>
          <span style={{ textAlign: 'center' }}>שעת עדכון</span>
          <span style={{ textAlign: 'center' }}>שם המעדכן</span>
        </div>

        {pageResidents.map(resident => {
          const status = getResidentStatus(resident.id)
          const statusLabel = status ? EMERGENCY_STATUS_LABELS[status.status] : 'ממתין'
          const statusColor = status ? EMERGENCY_STATUS_COLORS[status.status] : 'var(--color-text-secondary)'
          return (
            <div key={resident.id} style={{
              display: 'grid', gridTemplateColumns: '1.5fr 1fr 65px 70px',
              padding: '10px 14px', borderBottom: '1px solid var(--color-border)', fontSize: '12px',
            }}>
              <span style={{ fontWeight: 600 }}>{resident.name}</span>
              <span style={{ color: statusColor, fontWeight: 700, fontSize: '11px' }}>{statusLabel}</span>
              <span style={{ textAlign: 'center', fontSize: '10px', color: 'var(--color-text-secondary)' }}>
                {status ? formatTime(status.updatedAt) : '—'}
              </span>
              <span style={{ textAlign: 'center', fontSize: '10px', color: 'var(--color-text-secondary)' }}>
                {status?.updatedBy ?? '—'}
              </span>
            </div>
          )
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '12px' }}>
          <button
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0}
            style={{
              padding: '8px 14px', borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border)', background: 'var(--color-bg-card)',
              color: page === 0 ? 'var(--color-text-secondary)' : 'var(--color-accent)',
              cursor: page === 0 ? 'default' : 'pointer', fontSize: '13px', fontWeight: 700,
            }}
          >→</button>
          <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
            {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
            disabled={page >= totalPages - 1}
            style={{
              padding: '8px 14px', borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border)', background: 'var(--color-bg-card)',
              color: page >= totalPages - 1 ? 'var(--color-text-secondary)' : 'var(--color-accent)',
              cursor: page >= totalPages - 1 ? 'default' : 'pointer', fontSize: '13px', fontWeight: 700,
            }}
          >←</button>
        </div>
      )}

      {emergencyStatuses.length > 0 && (
        <button
          onClick={() => { if (confirm('האם לנקות את כל הסטטוסים?')) clearAllEmergencyStatuses() }}
          style={{
            display: 'block', width: '100%', marginTop: '16px', padding: '14px',
            borderRadius: 'var(--radius)',
            border: '1px solid rgba(232, 77, 77, 0.3)',
            background: 'rgba(232, 77, 77, 0.08)',
            color: 'var(--color-danger)', fontSize: '14px', fontWeight: 700, cursor: 'pointer',
          }}
        >
          ניקוי כלל הסטטוסים
        </button>
      )}

      <ExportButtons
        title="סטטוס תושבים בחירום"
        getText={() => {
          let text = `${emergencyStatuses.length}/${residents.length} עודכנו\n\n`
          typeCounts.forEach(t => { text += `${t.label}: ${t.count}\n` })
          text += '\n'
          emergencyStatuses.forEach(s => {
            const r = residents.find(res => res.id === s.residentId)
            text += `${r?.name ?? '?'} | ${EMERGENCY_STATUS_LABELS[s.status]} | ${s.updatedBy}\n`
          })
          return text
        }}
        getTableData={() => ({
          headers: ['שם', 'סטטוס', 'טלפון', 'שם המעדכן', 'שעת עדכון'],
          rows: residents.map(r => {
            const s = getResidentStatus(r.id)
            return [r.name, s ? EMERGENCY_STATUS_LABELS[s.status] : 'ממתין', r.phone, s?.updatedBy ?? '', s ? formatTime(s.updatedAt) : '']
          }),
        })}
      />
    </PageLayout>
  )
}
