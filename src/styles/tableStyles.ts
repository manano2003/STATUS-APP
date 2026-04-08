export const tableContainer: React.CSSProperties = {
  background: 'var(--color-bg-card)',
  borderRadius: 'var(--radius)',
  border: '1px solid var(--color-border)',
  overflow: 'hidden',
}

export const tableHeader: React.CSSProperties = {
  padding: '10px 14px',
  borderBottom: '1px solid var(--color-border)',
  fontSize: '11px',
  fontWeight: 700,
  color: 'var(--color-text-secondary)',
}

export const tableRow = (clickable = false): React.CSSProperties => ({
  padding: '10px 14px',
  borderBottom: '1px solid var(--color-border)',
  fontSize: '12px',
  cursor: clickable ? 'pointer' : 'default',
  transition: 'background 0.15s',
  alignItems: 'center',
})

export const emptyState: React.CSSProperties = {
  padding: '32px',
  textAlign: 'center',
  color: 'var(--color-text-secondary)',
  fontSize: '13px',
}

export const dangerButton: React.CSSProperties = {
  display: 'block',
  width: '100%',
  marginTop: '16px',
  padding: '14px',
  borderRadius: 'var(--radius)',
  border: '1px solid rgba(232, 77, 77, 0.3)',
  background: 'rgba(232, 77, 77, 0.08)',
  color: 'var(--color-danger)',
  fontSize: '14px',
  fontWeight: 700,
  cursor: 'pointer',
}
