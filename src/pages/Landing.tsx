import { Link } from 'react-router-dom'
import logo from '../assets/logo.jpeg'
import Button from '../components/Button'
import FeatureCard from '../components/FeatureCard'

const features = [
  {
    icon: '🎯',
    title: 'מיקוד מאמצי חילוץ',
    description: 'המידע מאפשר לכוחות לדלג על מבנים שדווחו כריקים ולהתמקד בדיוק היכן שנדרשים.',
    number: '01',
  },
  {
    icon: '🔍',
    title: 'זיהוי תושבים בסיכון',
    description: 'המערכת מציפה נתונים על תושבים שלא דיווחו מיקום ומאפשרת יצירת קשר מיידית עמם.',
    number: '02',
  },
  {
    icon: '🏛️',
    title: 'ניהול עומסי מקלטים',
    description: 'מעקב בזמן אמת אחר תפוסת המקלטים ומניעת צפיפות.',
    number: '03',
  },
  {
    icon: '⚡',
    title: 'חיסכון בזמן ומשאבים',
    description: 'התייעלות מהותית של כוחות החירום על ידי ניתוב חכם מבוסס נתונים.',
    number: '04',
  },
]

const roadmap = [
  { icon: '🔔', title: 'ממשק התרעות חכם', description: 'Push notification לדיווח סטטוס מהיר' },
  { icon: '🗺️', title: 'ניווט חירום למקלט', description: 'כפתור "קח אותי למקלט הקרוב" מבוסס GPS' },
  { icon: '🔄', title: 'ניתוב חכם מבוסס תפוסה', description: 'הפנייה אוטומטית למקלט הפנוי הקרוב בזמן אמת' },
  { icon: '🆘', title: 'לחצן מצוקה שקט', description: 'העברת מסרי חירום ישירה לחמ"ל' },
]

export default function Landing() {
  return (
    <div>
      {/* Hero Section */}
      <section style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '120px 24px 80px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background glow effect */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, var(--color-accent-glow) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <img
          src={logo}
          alt="STATUS Logo"
          style={{
            width: '280px',
            borderRadius: '16px',
            marginBottom: '32px',
            position: 'relative',
            boxShadow: '0 8px 40px rgba(77, 166, 232, 0.2)',
          }}
        />

        <h1 style={{
          fontSize: 'clamp(28px, 5vw, 48px)',
          fontWeight: 800,
          marginBottom: '16px',
          position: 'relative',
        }}>
          מערכת חכמה לניהול קהילות
          <br />
          <span style={{ color: 'var(--color-accent)' }}>בזמן אמת</span>
        </h1>

        <p style={{
          fontSize: 'clamp(16px, 2.5vw, 20px)',
          color: 'var(--color-text-secondary)',
          maxWidth: '600px',
          marginBottom: '40px',
          position: 'relative',
        }}>
          בימים בהם העורף הוא החזית — קבלת תמונת מצב מהירה ומדויקת היא קריטית להצלת חיים
        </p>

        <div style={{ display: 'flex', gap: '16px', position: 'relative', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link to="/report">
            <Button size="lg">דווח סטטוס</Button>
          </Link>
          <Link to="/login">
            <Button variant="secondary" size="lg">כניסה למערכת</Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section style={{
        padding: '80px 24px',
        maxWidth: '1100px',
        margin: '0 auto',
      }}>
        <h2 style={{
          textAlign: 'center',
          fontSize: '32px',
          fontWeight: 800,
          marginBottom: '12px',
        }}>
          ערך מבצעי
        </h2>
        <p style={{
          textAlign: 'center',
          color: 'var(--color-accent)',
          fontSize: '18px',
          marginBottom: '48px',
        }}>
          כיצד STATUS מציל חיים
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '20px',
        }}>
          {features.map(f => (
            <FeatureCard key={f.number} {...f} />
          ))}
        </div>
      </section>

      {/* User Experience Section */}
      <section style={{
        padding: '80px 24px',
        background: 'var(--color-bg-secondary)',
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '12px' }}>
            חווית משתמש
          </h2>
          <p style={{ color: 'var(--color-accent)', fontSize: '18px', marginBottom: '48px' }}>
            פשוט ומהיר ברגעי לחץ
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '24px',
            textAlign: 'center',
          }}>
            {[
              { icon: '👆', label: 'דיווח בלחיצת כפתור', desc: 'דיווח מיקום ומספר שוהים בכניסה למרחב המוגן' },
              { icon: '👤', label: 'פרופיל אישי', desc: 'הרשמה חד-פעמית: מייל, שם, טלפון וכתובת' },
              { icon: '📊', label: 'סטטוסים מדויקים', desc: '"בממ"ד" | "בבית ללא ממ"ד" | "מחוץ לישוב"' },
              { icon: '📱', label: 'סריקת ברקוד חכמה', desc: 'מדבקת ברקוד במקלטים ציבוריים לרישום מהיר' },
            ].map(item => (
              <div key={item.label} style={{ padding: '20px' }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>{item.icon}</div>
                <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px', color: 'var(--color-accent)' }}>
                  {item.label}
                </h4>
                <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roadmap Section */}
      <section style={{
        padding: '80px 24px',
        maxWidth: '1100px',
        margin: '0 auto',
      }}>
        <h2 style={{ textAlign: 'center', fontSize: '32px', fontWeight: 800, marginBottom: '12px' }}>
          בפיתוח
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--color-accent)', fontSize: '18px', marginBottom: '48px' }}>
          מפת דרכים טכנולוגית
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '20px',
        }}>
          {roadmap.map((item, i) => (
            <FeatureCard
              key={item.title}
              icon={item.icon}
              title={item.title}
              description={item.description}
              number={String(i + 1).padStart(2, '0')}
            />
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '32px 24px',
        textAlign: 'center',
        borderTop: '1px solid var(--color-border)',
        color: 'var(--color-text-secondary)',
        fontSize: '14px',
      }}>
        STATUS Community Awareness System &copy; {new Date().getFullYear()}
      </footer>
    </div>
  )
}
