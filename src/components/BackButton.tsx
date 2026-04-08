import { useNavigate } from 'react-router-dom'

export default function BackButton({ to }: { to?: string }) {
  const navigate = useNavigate()

  return (
    <button
      onClick={() => to ? navigate(to) : navigate(-1)}
      style={{
        background: 'none',
        border: 'none',
        color: 'var(--color-accent)',
        fontSize: '14px',
        cursor: 'pointer',
        padding: '4px 0',
        marginBottom: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
      }}
    >
      → חזרה
    </button>
  )
}
