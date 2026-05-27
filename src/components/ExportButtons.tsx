interface ExportButtonsProps {
  title: string
  getText: () => string
  getTableData?: () => { headers: string[]; rows: string[][] }
}

function sanitize(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

export default function ExportButtons({ title, getText }: ExportButtonsProps) {

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

  return (
    <div style={{ marginTop: '16px' }}>
      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={() => {
            const text = getText()
            const msg = encodeURIComponent(`*${title}*\n\n${text}`)
            window.open(`https://wa.me/?text=${msg}`, '_blank')
          }}
          style={{
            flex: 1, padding: '14px', borderRadius: 'var(--radius)',
            border: '1px solid var(--color-success)', background: 'rgba(77, 232, 138, 0.08)',
            color: 'var(--color-success)', fontSize: '14px', fontWeight: 700,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            fontFamily: 'var(--font-family)',
          }}
        >
          <span style={{ fontSize: '18px' }}>💬</span>
          WhatsApp
        </button>
        <button
          onClick={generatePDF}
          style={{
            flex: 1, padding: '14px', borderRadius: 'var(--radius)',
            border: '1px solid var(--color-border)', background: 'var(--color-bg-card)',
            color: 'var(--color-accent)', fontSize: '14px', fontWeight: 700,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            fontFamily: 'var(--font-family)',
          }}
        >
          <span style={{ fontSize: '18px' }}>🖨️</span>
          הדפסה
        </button>
      </div>
    </div>
  )
}
