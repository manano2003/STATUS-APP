import { useNavigate } from 'react-router-dom'
import { useStore } from '../data/store'
import { getDistressTypeInfo } from '../data/distressTypes'
import PageLayout from '../components/PageLayout'
import ExportButtons from '../components/ExportButtons'

export default function DashboardDistress() {
  const navigate = useNavigate()
  const { distressAlerts, clearAllDistressAlerts } = useStore()

  return (
    <PageLayout title="🆘 קריאות מצוקה" subtitle={`${distressAlerts.length} קריאות פעילות`} backTo="/dashboard/reports">

      <div style={{
        background: 'var(--color-bg-card)',
        borderRadius: 'var(--radius)',
        border: '1px solid var(--color-border)',
        overflow: 'hidden',
      }}>
        {distressAlerts.length === 0 ? (
          <p style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '13px' }}>
            אין קריאות מצוקה פעילות
          </p>
        ) : (
          <>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1.3fr 1fr 50px 70px',
              padding: '10px 12px',
              borderBottom: '1px solid var(--color-border)',
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--color-text-secondary)',
            }}>
              <span>שם</span>
              <span>טלפון</span>
              <span style={{ textAlign: 'center' }}>בית</span>
              <span style={{ textAlign: 'center' }}>אירוע</span>
            </div>
            {distressAlerts.map(alert => {
              const typeInfo = getDistressTypeInfo(alert.type)
              return (
                <div
                  key={alert.id}
                  onClick={() => navigate(`/dashboard/distress/${alert.id}`)}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1.3fr 1fr 50px 70px',
                    padding: '10px 12px',
                    borderBottom: '1px solid var(--color-border)',
                    fontSize: '12px',
                    alignItems: 'center',
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(232, 77, 77, 0.05)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <span style={{ fontWeight: 600, color: 'var(--color-accent)' }}>
                    {alert.userName}
                  </span>
                  <span style={{ direction: 'ltr', textAlign: 'right', fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                    {alert.userPhone ? `+972${alert.userPhone}` : '—'}
                  </span>
                  <span style={{ textAlign: 'center' }}>{alert.userHouseNumber || '—'}</span>
                  <span style={{
                    textAlign: 'center',
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: '8px',
                    background: 'rgba(232, 77, 77, 0.15)',
                    color: 'var(--color-danger)',
                  }}>
                    {typeInfo.label}
                  </span>
                </div>
              )
            })}
          </>
        )}
      </div>

      {distressAlerts.length > 0 && (
        <button
          onClick={() => { if (confirm('האם למחוק את כל קריאות המצוקה?')) clearAllDistressAlerts() }}
          style={{
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
          }}
        >
          מחק כלל הקריאות
        </button>
      )}

      <ExportButtons
        title="דוח קריאות מצוקה"
        getText={() => {
          let text = `${distressAlerts.length} קריאות פעילות\n\n`
          distressAlerts.forEach(a => {
            const t = getDistressTypeInfo(a.type)
            text += `${a.userName} | ${t.label} | טלפון: ${a.userPhone ? '+972' + a.userPhone : 'לא צוין'} | בית: ${a.userHouseNumber || 'לא צוין'}\n`
          })
          return text
        }}
        getTableData={() => ({
          headers: ['שם', 'סוג אירוע', 'טלפון', 'מספר בית'],
          rows: distressAlerts.map(a => {
            const t = getDistressTypeInfo(a.type)
            return [a.userName, t.label, a.userPhone ? '+972' + a.userPhone : '', a.userHouseNumber || '']
          }),
        })}
      />
    </PageLayout>
  )
}
