import type { ReactNode } from 'react'
import BackButton from './BackButton'

interface Props {
  title: string
  subtitle?: string
  backTo?: string
  children: ReactNode
}

export default function PageLayout({ title, subtitle, backTo, children }: Props) {
  return (
    <div style={{ paddingTop: '56px' }}>
      <div style={{
        position: 'sticky',
        top: 56,
        zIndex: 50,
        background: 'var(--color-bg-primary)',
        padding: '12px 16px 12px',
        borderBottom: '1px solid var(--color-border)',
      }}>
        {backTo && <BackButton to={backTo} />}
        <h1 style={{ fontSize: '22px', fontWeight: 800, marginBottom: subtitle ? '4px' : '0', textAlign: 'center' }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px', textAlign: 'center' }}>
            {subtitle}
          </p>
        )}
      </div>
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '16px 16px 100px' }}>
        {children}
      </div>
    </div>
  )
}
