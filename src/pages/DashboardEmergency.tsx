import { useState } from 'react'
import { residents } from '../data/residents'
import { useStore, EMERGENCY_STATUS_LABELS, EMERGENCY_STATUS_COLORS, type EmergencyStatusType } from '../data/store'
import BackButton from '../components/BackButton'
import ExportButtons from '../components/ExportButtons'

const PAGE_SIZE = 100

export default function DashboardEmergency() {
  const { emergencyStatuses, getResidentStatus, clearAllEmergencyStatuses } = useStore()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [filterStatus, setFilterStatus] = useState<EmergencyStatusType | 'pending' | null>(null)

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
    <div style={{ paddingTop: '68px', padding: '68px 16px 100px', maxWidth: '600px', margin: '0 auto' }}>
      <BackButton to="/dashboard" />

      <h1 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '4px', textAlign: 'center' }}>
        🚨 עדכון תושבים
      </h1>
      <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px', marginBottom: '4px', textAlign: 'center' }}>
        {emergencyStatuses.length}/{residents.length} עודכנו
      </p>
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
            onClick={() => { setFilterStatus(filterStatus === t.key ? null : t.key); setPage(0) }}
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
    </div>
  )
}
