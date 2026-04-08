export default function Dashboard() {
  const stats = [
    { label: 'סה"כ תושבים', value: '12,450', color: 'var(--color-accent)' },
    { label: 'דיווחו סטטוס', value: '8,320', color: 'var(--color-success)' },
    { label: 'לא דיווחו', value: '4,130', color: 'var(--color-warning)' },
    { label: 'מצוקה', value: '12', color: 'var(--color-danger)' },
  ]

  return (
    <div style={{ paddingTop: '80px', padding: '80px 24px 24px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px' }}>
          חמ"ל — תמונת מצב
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '32px' }}>
          התפקדות בזמן אמת ומיפוי מדויק של מיקום התושבים
        </p>

        {/* Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '32px',
        }}>
          {stats.map(s => (
            <div key={s.label} style={{
              background: 'var(--color-bg-card)',
              borderRadius: 'var(--radius)',
              padding: '24px',
              border: '1px solid var(--color-border)',
            }}>
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
                {s.label}
              </p>
              <p style={{ fontSize: '32px', fontWeight: 800, color: s.color }}>
                {s.value}
              </p>
            </div>
          ))}
        </div>

        {/* Map Placeholder */}
        <div style={{
          background: 'var(--color-bg-card)',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--color-border)',
          height: '400px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: '12px',
        }}>
          <span style={{ fontSize: '48px' }}>🗺️</span>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '18px' }}>
            מפת תושבים בזמן אמת
          </p>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>
            (ישולב בגרסה הבאה)
          </p>
        </div>

        {/* Recent Activity */}
        <div style={{
          marginTop: '32px',
          background: 'var(--color-bg-card)',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--color-border)',
          padding: '24px',
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px', color: 'var(--color-accent)' }}>
            פעילות אחרונה
          </h3>
          {[
            { time: '14:32', text: 'משפחת כהן דיווחו — בממ"ד (4 נפשות)', status: 'safe' },
            { time: '14:30', text: 'מקלט רח׳ הרצל — 85% תפוסה', status: 'warning' },
            { time: '14:28', text: 'דוד לוי — לחצן מצוקה הופעל', status: 'danger' },
            { time: '14:25', text: 'רונית אברהם — מחוץ לישוב', status: 'info' },
          ].map((item, i) => (
            <div key={i} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 0',
              borderBottom: i < 3 ? '1px solid var(--color-border)' : 'none',
            }}>
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: item.status === 'safe' ? 'var(--color-success)'
                  : item.status === 'warning' ? 'var(--color-warning)'
                  : item.status === 'danger' ? 'var(--color-danger)'
                  : 'var(--color-accent)',
                flexShrink: 0,
              }} />
              <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)', minWidth: '50px' }}>
                {item.time}
              </span>
              <span style={{ fontSize: '14px' }}>{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
