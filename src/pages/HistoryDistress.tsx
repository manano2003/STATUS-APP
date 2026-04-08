import { useStore } from '../data/store'
import { getDistressTypeInfo } from '../data/distressTypes'
import BackButton from '../components/BackButton'

export default function HistoryDistress() {
  const { distressHistory } = useStore()

  const formatDate = (ts: number) =>
    new Date(ts).toLocaleString('he-IL', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })

  return (
    <div style={{ paddingTop: '68px', padding: '68px 16px 100px', maxWidth: '600px', margin: '0 auto' }}>
      <BackButton to="/dashboard/history" />

      <h1 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' , justifyContent: 'center'}}>
        <span>🆘</span> קריאות מצוקה — היסטוריה
      </h1>
      <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px', marginBottom: '16px' , textAlign: 'center'}}>
        סה"כ <span style={{ color: 'var(--color-danger)', fontWeight: 800 }}>{distressHistory.length}</span> קריאות טופלו
      </p>

      <div style={{
        background: 'var(--color-bg-card)', borderRadius: 'var(--radius)',
        border: '1px solid var(--color-border)', overflow: 'hidden',
      }}>
        {distressHistory.length === 0 ? (
          <p style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '13px' }}>
            אין היסטוריה עדיין
          </p>
        ) : (
          <>
            <div style={{
              display: 'grid', gridTemplateColumns: '1.2fr 70px 1fr',
              padding: '8px 12px', borderBottom: '1px solid var(--color-border)',
              fontSize: '10px', fontWeight: 700, color: 'var(--color-text-secondary)',
            }}>
              <span>שם</span>
              <span style={{ textAlign: 'center' }}>אירוע</span>
              <span>טופל ע"י</span>
            </div>
            {distressHistory.map(entry => {
              const typeInfo = getDistressTypeInfo(entry.type)
              return (
                <div key={entry.id} style={{
                  display: 'grid', gridTemplateColumns: '1.2fr 70px 1fr',
                  padding: '10px 12px', borderBottom: '1px solid var(--color-border)',
                  fontSize: '12px',
                }}>
                  <div>
                    <p style={{ margin: 0, fontWeight: 600 }}>{entry.userName}</p>
                    <p style={{ margin: 0, fontSize: '9px', color: 'var(--color-text-secondary)' , textAlign: 'center'}}>
                      {formatDate(entry.timestamp)}
                    </p>
                  </div>
                  <span style={{
                    textAlign: 'center', fontSize: '10px', fontWeight: 700,
                    padding: '2px 6px', borderRadius: '8px',
                    background: 'rgba(232, 77, 77, 0.15)', color: 'var(--color-danger)',
                    alignSelf: 'center',
                  }}>
                    {typeInfo.label}
                  </span>
                  <div>
                    <p style={{ margin: 0, fontSize: '11px', color: 'var(--color-success)' }}>{entry.deletedBy}</p>
                    <p style={{ margin: 0, fontSize: '9px', color: 'var(--color-text-secondary)' , textAlign: 'center'}}>
                      {formatDate(entry.deletedAt)}
                    </p>
                  </div>
                </div>
              )
            })}
          </>
        )}
      </div>
    </div>
  )
}
