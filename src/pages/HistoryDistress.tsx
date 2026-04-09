import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { distressTypes, getDistressTypeInfo } from '../data/distressTypes'
import { useStore } from '../data/store'
import BackButton from '../components/BackButton'

export default function HistoryDistress() {
  const navigate = useNavigate()
  const { distressHistory } = useStore()
  const [search, setSearch] = useState('')
  const [searchResult, setSearchResult] = useState<string | null>(null)

  const formatDate = (ts: number) =>
    new Date(ts).toLocaleString('he-IL', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })

  const typeLabels = distressTypes.map(t => t.label)
  const matchingTypes = search.trim() ? typeLabels.filter(l => l.includes(search.trim())) : []

  const searchResults = searchResult
    ? distressHistory.filter(e => getDistressTypeInfo(e.type).label === searchResult)
    : []

  return (
    <div style={{ paddingTop: '68px', padding: '68px 16px 100px', maxWidth: '600px', margin: '0 auto' }}>
      <BackButton to="/dashboard/history" />

      <h1 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '4px', textAlign: 'center' }}>
        🆘 קריאות מצוקה — היסטוריה
      </h1>
      <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px', marginBottom: '16px', textAlign: 'center' }}>
        סה"כ <span style={{ color: 'var(--color-danger)', fontWeight: 800 }}>{distressHistory.length}</span> קריאות טופלו
      </p>

      {/* Search */}
      <div style={{ marginBottom: '16px', position: 'relative' }}>
        <input
          type="text"
          value={search}
          onChange={e => { setSearch(e.target.value); setSearchResult(null) }}
          placeholder="חיפוש סוג קריאה (רפואי, שריפה...)"
          style={{
            width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--color-border)', background: 'var(--color-bg-secondary)',
            color: 'var(--color-text)', fontSize: '14px', outline: 'none',
          }}
          onFocus={e => e.target.style.borderColor = 'var(--color-accent)'}
          onBlur={e => { setTimeout(() => e.target.style.borderColor = 'rgba(77, 166, 232, 0.2)', 200) }}
        />
        {matchingTypes.length > 0 && !searchResult && (
          <div style={{
            position: 'absolute', top: '100%', right: 0, left: 0, zIndex: 10,
            background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)',
          }}>
            {matchingTypes.map(label => (
              <button key={label} onClick={() => { setSearchResult(label); setSearch(label) }}
                style={{
                  display: 'block', width: '100%', padding: '10px 14px', fontSize: '13px',
                  background: 'none', border: 'none', borderBottom: '1px solid var(--color-border)',
                  color: 'var(--color-text)', cursor: 'pointer', textAlign: 'right',
                }}>
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Search results */}
      {searchResult && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-danger)', margin: 0 }}>תוצאות: {searchResult}</h3>
            <button onClick={() => { setSearchResult(null); setSearch('') }} style={{
              background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', fontSize: '12px',
            }}>נקה</button>
          </div>
          <div style={{
            background: 'var(--color-bg-card)', borderRadius: 'var(--radius)',
            border: '1px solid var(--color-border)', overflow: 'hidden',
          }}>
            {searchResults.length === 0 ? (
              <p style={{ padding: '20px', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '13px' }}>לא נמצאו תוצאות</p>
            ) : (
              <>
                <div style={{
                  display: 'grid', gridTemplateColumns: '1.2fr 1fr 80px',
                  padding: '8px 14px', borderBottom: '1px solid var(--color-border)',
                  fontSize: '11px', fontWeight: 700, color: 'var(--color-text-secondary)',
                }}>
                  <span>שם</span><span>טלפון</span><span style={{ textAlign: 'center' }}>תאריך</span>
                </div>
                {searchResults.map(e => (
                  <div key={e.id} style={{
                    display: 'grid', gridTemplateColumns: '1.2fr 1fr 80px',
                    padding: '10px 14px', borderBottom: '1px solid var(--color-border)', fontSize: '12px',
                  }}>
                    <span style={{ fontWeight: 600 }}>{e.userName}</span>
                    <span style={{ direction: 'ltr', textAlign: 'right', fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                      {e.userPhone ? `+972${e.userPhone}` : '—'}
                    </span>
                    <span style={{ textAlign: 'center', fontSize: '10px', color: 'var(--color-text-secondary)' }}>{formatDate(e.timestamp)}</span>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}

      {/* Distress types grid */}
      {!searchResult && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {distressTypes.map(type => {
            const count = distressHistory.filter(e => e.type === type.id).length
            return (
              <button
                key={type.id}
                onClick={() => navigate(`/dashboard/history/distress/${type.id}`)}
                style={{
                  background: 'var(--color-bg-card)', border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius)', padding: '20px 14px', cursor: 'pointer',
                  textAlign: 'center', transition: 'border-color 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-danger)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(77, 166, 232, 0.2)'}
              >
                <img src={type.imageUrl} alt={type.label}
                  style={{
                    width: '48px', height: '48px', objectFit: 'contain', margin: '0 auto 8px',
                    ...(type.id === 'medical' ? { filter: 'invert(1)' } : {}),
                  }} />
                <p style={{ fontSize: '14px', fontWeight: 800, color: 'var(--color-text)', margin: '0 0 4px' }}>{type.label}</p>
                <p style={{
                  fontSize: '13px', fontWeight: 800, margin: 0,
                  color: count > 0 ? 'var(--color-danger)' : 'var(--color-text-secondary)',
                }}>{count} קריאות</p>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
