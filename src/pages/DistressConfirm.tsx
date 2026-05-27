import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getDistressTypeInfo } from '../data/distressTypes'
import { loadEmergencyContacts, type EmergencyContact } from '../data/emergencyContacts'
import { useStore, type DistressType } from '../data/store'
import Button from '../components/Button'
import BackButton from '../components/BackButton'

export default function DistressConfirm() {
  const { type } = useParams<{ type: string }>()
  const navigate = useNavigate()
  const { currentUser, addDistressAlert } = useStore()
  const [submitted, setSubmitted] = useState(false)
  const [emergencyContacts, setEmergencyContacts] = useState<Record<DistressType, EmergencyContact[]>>({ medical: [], fire: [], missile: [], terror: [] })

  useEffect(() => { loadEmergencyContacts().then(setEmergencyContacts) }, [])

  const typeInfo = type ? getDistressTypeInfo(type as DistressType) : undefined

  if (!typeInfo) {
    return (
      <div style={{ paddingTop: '100px', textAlign: 'center' }}>
        <h1>סוג אירוע לא נמצא</h1>
        <Button onClick={() => navigate('/distress')} style={{ marginTop: '16px' }}>חזרה</Button>
      </div>
    )
  }

  if (submitted) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '16px',
        padding: '24px',
        textAlign: 'center',
      }}>
        <span style={{ fontSize: '64px' }}>🚨</span>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-danger)' , textAlign: 'center'}}>
          הקריאה נקלטה!
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '16px' , textAlign: 'center'}}>
          קריאת {typeInfo.label} נשלחה לחמ"ל
        </p>
      </div>
    )
  }

  const handleSubmit = () => {
    const userName = currentUser?.fullName ?? 'אורח'
    const userPhone = currentUser?.phone ?? ''
    const userHouse = currentUser?.houseNumber ?? ''
    const city = currentUser?.city ?? ''

    addDistressAlert({
      id: Date.now().toString(),
      userId: currentUser?.id ?? 'anonymous-' + Date.now(),
      userName,
      userPhone,
      userHouseNumber: userHouse,
      type: typeInfo.id,
      timestamp: Date.now(),
    })

    // Send WhatsApp to all contacts for this event type
    const contacts = emergencyContacts[typeInfo.id]
    const msg = encodeURIComponent(
      `🚨 קריאת מצוקה - ${typeInfo.label}\n\n` +
      `שם: ${userName}\n` +
      `טלפון: ${userPhone ? '+972' + userPhone : 'לא צוין'}\n` +
      `בית: ${userHouse || 'לא צוין'}\n` +
      `ישוב: ${city || 'לא צוין'}\n\n` +
      `נשלח מאפליקציית STATUS`
    )
    // Open WhatsApp for each contact
    contacts.forEach((contact, i) => {
      setTimeout(() => {
        window.open(`https://wa.me/972${contact.phone}?text=${msg}`, '_blank')
      }, i * 500)
    })

    setSubmitted(true)
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '68px 24px 24px',
    }}>
      <div style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}>
        <BackButton to="/distress" />

        <div style={{
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          overflow: 'hidden',
          margin: '0 auto 24px',
          border: '3px solid var(--color-danger)',
        }}>
          <img
            src={typeInfo.imageUrl}
            alt={typeInfo.label}
            style={{
              width: '100%', height: '100%', objectFit: 'cover',
              ...(typeInfo.id === 'medical' ? { filter: 'invert(1)' } : {}),
            }}
          />
        </div>

        <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '8px' , textAlign: 'center'}}>
          {typeInfo.label}
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', marginBottom: '32px' , textAlign: 'center'}}>
          לחץ על הכפתור לשליחת קריאת מצוקה לחמ"ל
        </p>

        <Button
          variant="danger"
          size="lg"
          style={{ width: '100%', fontSize: '18px', padding: '18px' }}
          onClick={handleSubmit}
        >
          שלח קריאת מצוקה
        </Button>
      </div>
    </div>
  )
}
