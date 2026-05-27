import { useNavigate } from 'react-router-dom'
import PageLayout from '../components/PageLayout'

export default function AdminCommunities() {
  const navigate = useNavigate()

  const buttonStyle = {
    background: 'var(--color-bg-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius)',
    width: '160px',
    padding: '32px 16px',
    cursor: 'pointer',
    textAlign: 'center' as const,
    transition: 'all 0.2s ease',
  }

  const hoverIn = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.borderColor = 'var(--color-accent)'
    e.currentTarget.style.transform = 'translateY(-2px)'
    e.currentTarget.style.boxShadow = 'var(--shadow-glow)'
  }
  const hoverOut = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.borderColor = 'rgba(77, 166, 232, 0.2)'
    e.currentTarget.style.transform = 'translateY(0)'
    e.currentTarget.style.boxShadow = 'none'
  }

  return (
    <PageLayout title="ראשי">
      <div style={{
        display: 'flex',
        flexWrap: 'wrap' as const,
        gap: '16px',
        justifyContent: 'center',
      }}>
        <button onClick={() => navigate('/communities/list')} style={buttonStyle} onMouseEnter={hoverIn} onMouseLeave={hoverOut}>
          <span style={{ fontSize: '48px', display: 'block', marginBottom: '12px' }}>🏘️</span>
          <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-text)' }}>ישובים</span>
        </button>

        <button onClick={() => navigate('/schools/councils')} style={buttonStyle} onMouseEnter={hoverIn} onMouseLeave={hoverOut}>
          <span style={{ fontSize: '48px', display: 'block', marginBottom: '12px' }}>🏫</span>
          <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-text)' }}>בתי ספר</span>
        </button>

        <button onClick={() => navigate('/admin/management')} style={buttonStyle} onMouseEnter={hoverIn} onMouseLeave={hoverOut}>
          <span style={{ fontSize: '48px', display: 'block', marginBottom: '12px' }}>⚙️</span>
          <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-text)' }}>ניהול</span>
        </button>
      </div>
    </PageLayout>
  )
}
