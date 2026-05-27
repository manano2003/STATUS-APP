import { useState } from 'react'
import { getRegularShelters } from '../data/shelters'
import { getIssueChecklist, MAINTENANCE_PHONE } from '../data/shelterIssues'
import { useStore } from '../data/store'
import PageLayout from '../components/PageLayout'
import Button from '../components/Button'

export default function ShelterIssues() {
  const { currentUser, addIssueReport } = useStore()
  const [selectedShelter, setSelectedShelter] = useState<string | null>(null)
  const [checkedIssues, setCheckedIssues] = useState<Set<string>>(new Set())
  const [submitted, setSubmitted] = useState(false)
  const regularShelters = getRegularShelters()
  const currentIssueChecklist = getIssueChecklist()

  const shelter = regularShelters.find(s => s.id === selectedShelter)

  const toggleIssue = (issue: string) => {
    setCheckedIssues(prev => {
      const next = new Set(prev)
      if (next.has(issue)) next.delete(issue)
      else next.add(issue)
      return next
    })
  }

  const handleSubmit = () => {
    if (!shelter || checkedIssues.size === 0) return
    addIssueReport({
      id: Date.now().toString(),
      shelterId: shelter.id,
      shelterName: shelter.name,
      issues: Array.from(checkedIssues),
      reportedBy: currentUser?.fullName ?? 'מנהל מקלט',
      timestamp: Date.now(),
    })
    setSubmitted(true)
  }

  if (submitted && shelter) {
    const issuesList = Array.from(checkedIssues).join('\n- ')
    const whatsappText = encodeURIComponent(`דיווח תקלות - ${shelter.name} (מקלט ${shelter.number}):\n- ${issuesList}\n\nדווח ע"י: ${currentUser?.fullName ?? 'מנהל מקלט'}`)
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: '16px', padding: '24px', textAlign: 'center',
      }}>
        <span style={{ fontSize: '64px' }}>✅</span>
        <h1 style={{ fontSize: '24px', fontWeight: 800 , textAlign: 'center'}}>הרשימה נשלחה!</h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' , textAlign: 'center'}}>
          {checkedIssues.size} תקלות דווחו ב{shelter.name}
        </p>
        <a
          href={`https://wa.me/972${MAINTENANCE_PHONE}?text=${whatsappText}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            padding: '14px 28px', borderRadius: 'var(--radius)',
            background: 'rgba(77, 232, 138, 0.15)', border: '1px solid var(--color-success)',
            color: 'var(--color-success)', fontSize: '15px', fontWeight: 700, textDecoration: 'none',
            marginTop: '8px',
          }}
        >
          <span style={{ fontSize: '20px' }}>💬</span>
          שלח לאחראי תיקונים בוואטסאפ
        </a>
        <Button variant="secondary" onClick={() => {
          setSelectedShelter(null)
          setCheckedIssues(new Set())
          setSubmitted(false)
        }} style={{ marginTop: '8px' }}>
          דיווח מקלט נוסף
        </Button>
      </div>
    )
  }

  // Step 1: Choose shelter
  if (!selectedShelter) {
    return (
      <PageLayout title="תקלות במקלטים" subtitle="בחר מקלט לדיווח תקלות">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {regularShelters.map(s => (
            <button
              key={s.id}
              onClick={() => setSelectedShelter(s.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '12px 14px', background: 'var(--color-bg-card)',
                border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)',
                cursor: 'pointer', color: 'var(--color-text)', fontSize: '14px', fontWeight: 600,
                transition: 'border-color 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-accent)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(77, 166, 232, 0.2)'}
            >
              <span style={{ color: 'var(--color-text-secondary)', fontSize: '12px', minWidth: '24px' }}>{s.number}</span>
              {s.name}
            </button>
          ))}
        </div>
      </PageLayout>
    )
  }

  // Step 2: Checklist
  return (
    <PageLayout title={`${shelter?.name} — מקלט ${shelter?.number}`} subtitle="סמן את התקלות שנמצאו">

      {checkedIssues.size === 0 && (
        <button
          onClick={() => { setSelectedShelter(null); setCheckedIssues(new Set()); setSubmitted(false) }}
          style={{
            position: 'fixed', top: 60, left: 16, zIndex: 9999,
            background: 'rgba(77, 166, 232, 0.15)', border: 'none',
            color: 'var(--color-accent)', fontSize: '14px', fontWeight: 800,
            cursor: 'pointer', padding: '4px 10px', borderRadius: '6px',
            display: 'flex', alignItems: 'center', gap: '4px',
          }}
        >
          ← חזרה
        </button>
      )}

      <div style={{
        background: 'var(--color-bg-card)',
        borderRadius: 'var(--radius)',
        border: '1px solid var(--color-border)',
        overflow: 'hidden',
        marginBottom: '16px',
      }}>
        {currentIssueChecklist.map((issue, i) => {
          const checked = checkedIssues.has(issue)
          return (
            <div
              key={issue}
              onClick={() => toggleIssue(issue)}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '12px 14px',
                borderBottom: i < currentIssueChecklist.length - 1 ? '1px solid var(--color-border)' : 'none',
                cursor: 'pointer',
                background: checked ? 'rgba(232, 77, 77, 0.05)' : 'transparent',
              }}
            >
              <div style={{
                width: '22px', height: '22px', borderRadius: '50%',
                border: checked ? '2px solid var(--color-danger)' : '2px solid var(--color-border)',
                background: checked ? 'var(--color-danger)' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, transition: 'all 0.2s',
              }}>
                {checked && <span style={{ color: 'white', fontSize: '12px', fontWeight: 800 }}>✓</span>}
              </div>
              <span style={{
                fontSize: '14px', fontWeight: checked ? 700 : 400,
                color: checked ? 'var(--color-danger)' : 'var(--color-text)',
              }}>
                {issue}
              </span>
            </div>
          )
        })}
      </div>

      <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '12px' }}>
        {checkedIssues.size} תקלות נבחרו
      </p>

      <Button
        size="lg"
        variant="danger"
        disabled={checkedIssues.size === 0}
        onClick={handleSubmit}
        style={{ width: '100%', opacity: checkedIssues.size > 0 ? 1 : 0.5 }}
      >
        שלח רשימת תקלות
      </Button>
    </PageLayout>
  )
}
