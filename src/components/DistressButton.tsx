import { useNavigate, useLocation } from 'react-router-dom'

export default function DistressButton() {
  const navigate = useNavigate()
  const location = useLocation()

  // Hide on dashboard pages
  if (location.pathname.startsWith('/dashboard')) return null

  return (
    <button
      onClick={() => navigate('/distress')}
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '24px',
        zIndex: 90,
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        border: '2px solid var(--color-danger)',
        background: 'rgba(232, 77, 77, 0.15)',
        backdropFilter: 'blur(8px)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '28px',
        boxShadow: '0 4px 20px rgba(232, 77, 77, 0.3)',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = 'rgba(232, 77, 77, 0.3)'
        e.currentTarget.style.transform = 'scale(1.1)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'rgba(232, 77, 77, 0.15)'
        e.currentTarget.style.transform = 'scale(1)'
      }}
      title="לחצן מצוקה"
    >
      🆘
    </button>
  )
}
