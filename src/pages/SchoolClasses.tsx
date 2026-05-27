import SchoolHome from './SchoolHome'

export default function SchoolClasses() {
  return (
    <SchoolHome content={
      <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)', marginTop: '20px' }}>
        אזור בבניה - כאן יופיעו ריבועי הכיתות
      </p>
    } />
  )
}
