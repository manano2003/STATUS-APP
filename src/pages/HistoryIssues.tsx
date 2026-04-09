import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { regularShelters } from '../data/shelters'
import { issueChecklist } from '../data/shelterIssues'
import { useStore } from '../data/store'
import BackButton from '../components/BackButton'

export default function HistoryIssues() {
  const navigate = useNavigate()
  const { issueHistory } = useStore()
  const [search, setSearch] = useState('')
  const [searchResult, setSearchResult] = useState<string | null>(null)

  const formatDate = (ts: number) =>
    new Date(ts).toLocaleString('he-IL', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })

  const matchingIssues = search.trim()
    ? issueChecklist.filter(i => i.includes(search.trim()))
    : []

  const searchResults = searchResult
    ? issueHistory.filter(e => e.issue === searchResult)
    : []

  return (
    <div style={{ paddingTop: '68px', padding: '68px 16px 100px', maxWidth: '600px', margin: '0 auto' }}>
      <BackButton to="/dashboard/history" />

      <h1 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '4px', textAlign: 'center' }}>
        🔧 תקלות שתוקנו
      </h1>
      <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px', marginBottom: '16px', textAlign: 'center' }}>
        סה"כ <span style={{ color: 'var(--color-accent)', fontWeight: 800 }}>{issueHistory.length}</span> תקלות תוקנו
      </p>

      {/* Search */}
      <div style={{ marginBottom: '16px', position: 'relative' }}>
        <input
          type="text"
          value={search}
          onChange={e => { setSearch(e.target.value); setSearchResult(null) }}
          placeholder="חיפוש תקלה..."
          style={{
            width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--color-border)', background: 'var(--color-bg-secondary)',
            color: 'var(--color-text)', fontSize: '14px', outline: 'none',
          }}
          onFocus={e => e.target.style.borderColor = 'var(--color-accent)'}
          onBlur={e => { setTimeout(() => e.target.style.borderColor = 'rgba(77, 166, 232, 0.2)', 200) }}
        />
        {matchingIssues.length > 0 && !searchResult && (
          <div style={{
            position: 'absolute', top: '100%', right: 0, left: 0, zIndex: 10,
            background: 'var(--color-bg-card)', border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)', maxHeight: '200px', overflowY: 'auto',
          }}>
            {matchingIssues.map(issue => (
              <button key={issue} onClick={() => { setSearchResult(issue); setSearch(issue) }}
                style={{
                  display: 'block', width: '100%', padding: '10px 14px', fontSize: '13px',
                  background: 'none', border: 'none', borderBottom: '1px solid var(--color-border)',
                  color: 'var(--color-text)', cursor: 'pointer', textAlign: 'right',
                }}>
                {issue}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Search results */}
      {searchResult && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-accent)', margin: 0 }}>
              תוצאות: {searchResult}
            </h3>
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
                  <span>מקלט</span><span>תוקן ע"י</span><span style={{ textAlign: 'center' }}>תאריך</span>
                </div>
                {searchResults.map(e => (
                  <div key={e.id} style={{
                    display: 'grid', gridTemplateColumns: '1.2fr 1fr 80px',
                    padding: '10px 14px', borderBottom: '1px solid var(--color-border)', fontSize: '12px',
                  }}>
                    <span style={{ fontWeight: 600 }}>{e.shelterName}</span>
                    <span style={{ color: 'var(--color-success)' }}>{e.resolvedBy}</span>
                    <span style={{ textAlign: 'center', fontSize: '10px', color: 'var(--color-text-secondary)' }}>{formatDate(e.resolvedAt)}</span>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}

      {/* Shelters list */}
      {!searchResult && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {regularShelters.map(shelter => {
            const count = issueHistory.filter(e => e.shelterId === shelter.id).length
            return (
              <button
                key={shelter.id}
                onClick={() => navigate(`/dashboard/history/issues/${shelter.id}`)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '14px',
                  padding: '14px', background: 'var(--color-bg-card)',
                  border: '1px solid var(--color-border)', borderRadius: 'var(--radius)',
                  cursor: 'pointer', textAlign: 'right', color: 'var(--color-text)',
                  transition: 'border-color 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-accent)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(77, 166, 232, 0.2)'}
              >
                <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', minWidth: '20px' }}>{shelter.number}</span>
                <span style={{ fontSize: '14px', fontWeight: 700, flex: 1 }}>{shelter.name}</span>
                <span style={{
                  fontSize: '13px', fontWeight: 800,
                  color: count > 0 ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                }}>{count} תיקונים</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
