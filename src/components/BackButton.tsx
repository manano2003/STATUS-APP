import { useNavigate } from 'react-router-dom'

export default function BackButton({ to }: { to?: string }) {
  const navigate = useNavigate()

  return (
    <button
      onClick={() => to ? navigate(to) : navigate(-1)}
      style={{
        position: 'fixed',
        top: 60,
        left: 16,
        zIndex: 9999,
        background: 'rgba(77, 166, 232, 0.15)',
        border: 'none',
        color: 'var(--color-accent)',
        fontSize: '14px',
        fontWeight: 800,
        cursor: 'pointer',
        padding: '4px 10px',
        borderRadius: '6px',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
      }}
    >
      ← חזרה
    </button>
  )
}
