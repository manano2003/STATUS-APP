import { QRCodeSVG } from 'qrcode.react'
import { getRegularShelters } from '../data/shelters'
import PageLayout from '../components/PageLayout'

function sanitize(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

export default function ShelterQRCodes() {
  const regularShelters = getRegularShelters()

  const getQRUrl = (shelterId: string) => {
    // In production this will be the real domain
    return `${window.location.origin}/STATUS-APP/shelter/${shelterId}`
  }

  const handlePrint = (shelterName: string, shelterNumber: number, shelterId: string) => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    // Create a temporary canvas to convert SVG to image
    const svgElement = document.getElementById(`qr-${shelterId}`)
    if (!svgElement) return

    const svgData = new XMLSerializer().serializeToString(svgElement)
    const svgBase64 = btoa(unescape(encodeURIComponent(svgData)))
    const imgSrc = `data:image/svg+xml;base64,${svgBase64}`

    printWindow.document.write(`
      <html dir="rtl"><head><title>QR - ${sanitize(shelterName)}</title>
      <style>
        body { font-family: Arial; display: flex; flex-direction: column; align-items: center;
          justify-content: center; min-height: 100vh; margin: 0; }
        .container { text-align: center; padding: 40px; border: 3px solid #0A1628;
          border-radius: 16px; max-width: 400px;
          display: flex; flex-direction: column; align-items: center; justify-content: center; }
        h1 { font-size: 28px; margin: 0 0 4px; color: #0A1628; }
        h2 { font-size: 18px; margin: 0 0 20px; color: #666; }
        img { width: 250px; height: 250px; }
        p { font-size: 14px; color: #888; margin: 16px 0 0; }
        .brand { font-size: 20px; font-weight: 800; letter-spacing: 3px; color: #0A1628; margin-top: 16px; }
        .sub { font-size: 10px; color: #888; letter-spacing: 1px; }
      </style></head>
      <body>
        <div class="container">
          <h1>${sanitize(shelterName)}</h1>
          <h2>מקלט ${shelterNumber}</h2>
          <img src="${imgSrc}" />
          <p>סרקו את הברקוד כדי להירשם למקלט</p>
          <div class="brand">STATUS</div>
          <div class="sub">COMMUNITY AWARENESS SYSTEM</div>
        </div>
        <script>setTimeout(() => window.print(), 300)<\/script>
      </body></html>
    `)
    printWindow.document.close()
  }

  return (
    <PageLayout title="ברקודים למקלטים" subtitle={`${regularShelters.length} מקלטים — הדפס ותלה על קיר המקלט`} backTo="/dashboard/sources">

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {regularShelters.map(shelter => (
          <div key={shelter.id} style={{
            background: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius)',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}>
            {/* QR Code */}
            <div style={{
              background: 'white',
              padding: '8px',
              borderRadius: '8px',
              flexShrink: 0,
            }}>
              <QRCodeSVG
                id={`qr-${shelter.id}`}
                value={getQRUrl(shelter.id)}
                size={80}
                level="M"
              />
            </div>

            {/* Info */}
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-text)', margin: '0 0 2px' }}>
                {shelter.name}
              </p>
              <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '0 0 8px' }}>
                מקלט {shelter.number}
              </p>
              <button
                onClick={() => handlePrint(shelter.name, shelter.number, shelter.id)}
                style={{
                  padding: '6px 16px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-accent)',
                  background: 'rgba(77, 166, 232, 0.1)',
                  color: 'var(--color-accent)',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span>🖨️</span> הדפס
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Print all button */}
      <button
        onClick={() => {
          const printWindow = window.open('', '_blank')
          if (!printWindow) return

          let pages = ''
          regularShelters.forEach(shelter => {
            const svgEl = document.getElementById(`qr-${shelter.id}`)
            if (!svgEl) return
            const svgData = new XMLSerializer().serializeToString(svgEl)
            const svgBase64 = btoa(unescape(encodeURIComponent(svgData)))
            const imgSrc = `data:image/svg+xml;base64,${svgBase64}`
            pages += `
              <div class="page">
                <h1>${sanitize(shelter.name)}</h1>
                <h2>מקלט ${shelter.number}</h2>
                <img src="${imgSrc}" />
                <p>סרקו את הברקוד כדי להירשם למקלט</p>
                <div class="brand">STATUS</div>
                <div class="sub">COMMUNITY AWARENESS SYSTEM</div>
              </div>
            `
          })

          printWindow.document.write(`
            <html dir="rtl"><head><title>כל הברקודים</title>
            <style>
              body { font-family: Arial; margin: 0; }
              .page { text-align: center; padding: 40px; border: 3px solid #0A1628;
                border-radius: 16px; max-width: 400px;
                margin: 0 auto;
                page-break-after: always;
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                min-height: 100vh; box-sizing: border-box; }
              .page:last-child { page-break-after: auto; }
              h1 { font-size: 28px; margin: 0 0 4px; color: #0A1628; }
              h2 { font-size: 18px; margin: 0 0 20px; color: #666; }
              img { width: 250px; height: 250px; }
              p { font-size: 14px; color: #888; margin: 16px 0 0; }
              .brand { font-size: 20px; font-weight: 800; letter-spacing: 3px; color: #0A1628; margin-top: 16px; }
              .sub { font-size: 10px; color: #888; letter-spacing: 1px; }
            </style></head>
            <body>${pages}
            <script>setTimeout(() => window.print(), 500)<\/script>
            </body></html>
          `)
          printWindow.document.close()
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          width: '100%',
          marginTop: '20px',
          padding: '16px',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--color-accent)',
          background: 'linear-gradient(135deg, var(--color-accent), #3A8FD4)',
          color: 'white',
          fontSize: '16px',
          fontWeight: 800,
          cursor: 'pointer',
        }}
      >
        <span>🖨️</span> הדפס את כל הברקודים
      </button>
    </PageLayout>
  )
}
