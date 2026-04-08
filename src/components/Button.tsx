import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
}

export default function Button({
  variant = 'primary',
  size = 'md',
  children,
  style,
  ...props
}: ButtonProps) {
  const baseStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    cursor: 'pointer',
    fontWeight: 700,
    transition: 'all 0.2s ease',
    fontFamily: 'var(--font-family)',
  }

  const variants: Record<string, React.CSSProperties> = {
    primary: {
      background: 'linear-gradient(135deg, var(--color-accent), #3A8FD4)',
      color: '#FFFFFF',
      boxShadow: '0 4px 15px var(--color-accent-glow)',
    },
    secondary: {
      background: 'transparent',
      color: 'var(--color-accent)',
      border: '2px solid var(--color-accent)',
    },
    danger: {
      background: 'var(--color-danger)',
      color: '#FFFFFF',
    },
  }

  const sizes: Record<string, React.CSSProperties> = {
    sm: { padding: '8px 16px', fontSize: '14px' },
    md: { padding: '12px 24px', fontSize: '16px' },
    lg: { padding: '16px 36px', fontSize: '18px', borderRadius: 'var(--radius)' },
  }

  return (
    <button
      style={{ ...baseStyle, ...variants[variant], ...sizes[size], ...style }}
      {...props}
    >
      {children}
    </button>
  )
}
