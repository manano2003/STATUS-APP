import { useState } from 'react'

interface ExportButtonsProps {
  title: string
  getText: () => string
  getTableData?: () => { headers: string[]; rows: string[][] }
}

function sanitize(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

export default function ExportButtons({ title, getText, getTableData }: ExportButtonsProps) {
  const [showOptions, setShowOptions] = useState<'email' | 'whatsapp' | null>(null)

  const generatePDF = () => {
    const text = getText()
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <html dir="rtl"><head><title>${sanitize(title)}</title>
        <style>body{font-family:Arial;padding:40px;direction:rtl}
        h1{color:#0A1628;border-bottom:2px solid #4DA6E8;padding-bottom:10px}
        pre{white-space:pre-wrap;font-family:Arial;font-size:14px;line-height:1.8}</style></head>
        <body><h1>${sanitize(title)}</h1><pre>${sanitize(text)}</pre>
        <script>window.print()<\/script></body></html>
      `)
      printWindow.document.close()
    }
  }

  const generateExcel = () => {
    if (!getTableData) return
    const { headers, rows } = getTableData()
    // Build CSV with BOM for Hebrew support
    const bom = '\uFEFF'
    const csv = bom + [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleSend = (method: 'email' | 'whatsapp', format: 'pdf' | 'excel' | 'both') => {
    if (format === 'pdf' || format === 'both') generatePDF()
    if ((format === 'excel' || format === 'both') && getTableData) generateExcel()

    const text = getText()
    if (method === 'email') {
      const subject = encodeURIComponent(title)
      const body = encodeURIComponent(text + '\n\n(קובץ מצורף)')
      window.open(`mailto:?subject=${subject}&body=${body}`, '_blank')
    } else {
      const msg = encodeURIComponent(`*${title}*\n\n${text}`)
      window.open(`https://wa.me/?text=${msg}`, '_blank')
    }
    setShowOptions(null)
  }

  return (
    <div style={{ marginTop: '16px' }}>
      {/* Main buttons */}
      {!showOptions && (
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setShowOptions('email')}
            style={{
              flex: 1, padding: '14px', borderRadius: 'var(--radius)',
              border: '1px solid var(--color-border)', background: 'var(--color-bg-card)',
              color: 'var(--color-accent)', fontSize: '14px', fontWeight: 700,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            }}
          >
            <span style={{ fontSize: '18px' }}>📧</span>
            שלח למייל
          </button>
          <button
            onClick={() => setShowOptions('whatsapp')}
            style={{
              flex: 1, padding: '14px', borderRadius: 'var(--radius)',
              border: '1px solid var(--color-success)', background: 'rgba(77, 232, 138, 0.08)',
              color: 'var(--color-success)', fontSize: '14px', fontWeight: 700,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            }}
          >
            <span style={{ fontSize: '18px' }}>💬</span>
            WhatsApp
          </button>
        </div>
      )}

      {/* Format selection */}
      {showOptions && (
        <div style={{
          background: 'var(--color-bg-card)', border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius)', padding: '16px',
        }}>
          <p style={{
            fontSize: '14px', fontWeight: 700, marginBottom: '12px', textAlign: 'center',
            color: showOptions === 'whatsapp' ? 'var(--color-success)' : 'var(--color-accent)',
          }}>
            {showOptions === 'whatsapp' ? '💬 WhatsApp' : '📧 מייל'} — בחר פורמט
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => handleSend(showOptions, 'pdf')}
              style={{
                flex: 1, padding: '12px 8px', borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)', background: 'var(--color-bg-secondary)',
                color: 'var(--color-text)', fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
              }}
            >
              <span style={{ fontSize: '24px' }}>📄</span>
              PDF
            </button>
            {getTableData && (
              <button
                onClick={() => handleSend(showOptions, 'excel')}
                style={{
                  flex: 1, padding: '12px 8px', borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)', background: 'var(--color-bg-secondary)',
                  color: 'var(--color-text)', fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                }}
              >
                <span style={{ fontSize: '24px' }}>📊</span>
                Excel
              </button>
            )}
            {getTableData && (
              <button
                onClick={() => handleSend(showOptions, 'both')}
                style={{
                  flex: 1, padding: '12px 8px', borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-accent)', background: 'rgba(77, 166, 232, 0.1)',
                  color: 'var(--color-accent)', fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                }}
              >
                <span style={{ fontSize: '24px' }}>📦</span>
                שניהם
              </button>
            )}
          </div>
          <button
            onClick={() => setShowOptions(null)}
            style={{
              width: '100%', marginTop: '10px', padding: '8px',
              background: 'none', border: 'none', color: 'var(--color-text-secondary)',
              fontSize: '12px', cursor: 'pointer',
            }}
          >
            ביטול
          </button>
        </div>
      )}
    </div>
  )
}
