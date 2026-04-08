interface FeatureCardProps {
  icon: string
  title: string
  description: string
  number?: string
}

export default function FeatureCard({ icon, title, description, number }: FeatureCardProps) {
  return (
    <div style={{
      background: 'var(--color-bg-card)',
      borderRadius: 'var(--radius)',
      padding: '28px 24px',
      border: '1px solid var(--color-border)',
      transition: 'all 0.3s ease',
      position: 'relative',
      overflow: 'hidden',
    }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'var(--color-accent)'
        e.currentTarget.style.boxShadow = 'var(--shadow-glow)'
        e.currentTarget.style.transform = 'translateY(-4px)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'rgba(77, 166, 232, 0.2)'
        e.currentTarget.style.boxShadow = 'none'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      {number && (
        <span style={{
          position: 'absolute',
          top: '12px',
          left: '16px',
          fontSize: '48px',
          fontWeight: 800,
          color: 'rgba(77, 166, 232, 0.08)',
          lineHeight: 1,
        }}>
          {number}
        </span>
      )}
      <div style={{ fontSize: '32px', marginBottom: '12px' }}>{icon}</div>
      <h3 style={{
        fontSize: '18px',
        fontWeight: 700,
        marginBottom: '8px',
        color: 'var(--color-accent)',
      }}>
        {title}
      </h3>
      <p style={{
        fontSize: '14px',
        color: 'var(--color-text-secondary)',
        lineHeight: 1.7,
      }}>
        {description}
      </p>
    </div>
  )
}
