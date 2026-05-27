import { useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import SchoolHome from './SchoolHome'
import * as XLSX from 'xlsx'

interface SchoolClass {
  name: string
  students: string[]
}

const STORAGE_KEY_PREFIX = 'school_classes_'

function loadClasses(schoolId: string): SchoolClass[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY_PREFIX + schoolId) || '[]') } catch { return [] }
}

function saveClasses(schoolId: string, classes: SchoolClass[]) {
  localStorage.setItem(STORAGE_KEY_PREFIX + schoolId, JSON.stringify(classes))
}

export default function SchoolStudents() {
  const { schoolId } = useParams<{ schoolId: string }>()
  const [classes, setClasses] = useState<SchoolClass[]>(() => loadClasses(schoolId || ''))
  const [pendingUpload, setPendingUpload] = useState<SchoolClass[] | null>(null)
  const [expandedClass, setExpandedClass] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const totalStudents = classes.reduce((sum, c) => sum + c.students.length, 0)

  const update = (newClasses: SchoolClass[]) => {
    setClasses(newClasses)
    saveClasses(schoolId || '', newClasses)
  }

  const removeStudent = (className: string, studentName: string) => {
    update(classes.map(c => c.name === className ? { ...c, students: c.students.filter(s => s !== studentName) } : c))
  }

  const handleDownloadTemplate = () => {
    const wb = XLSX.utils.book_new()
    const exampleNames = ['א-1', 'א-2']
    exampleNames.forEach(name => {
      const ws = XLSX.utils.aoa_to_sheet([
        ['תפקיד', 'שם מלא'],
        ['תלמיד', ''],
      ])
      ws['!cols'] = [{ wch: 10 }, { wch: 25 }]
      XLSX.utils.book_append_sheet(wb, ws, name)
    })
    XLSX.writeFile(wb, 'תבנית_תלמידים_וכיתות.xlsx')
  }

  const handleUploadExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target?.result as ArrayBuffer)
      const wb = XLSX.read(data, { type: 'array' })
      const newClasses: SchoolClass[] = wb.SheetNames.map(name => {
        const ws = wb.Sheets[name]
        const rows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 })
        const students: string[] = []
        for (let i = 1; i < rows.length; i++) {
          const row = rows[i]
          if (!row || !row[1]) continue
          const studentName = String(row[1]).trim()
          if (studentName) students.push(studentName)
        }
        return { name, students: [...new Set(students)] }
      })
      setPendingUpload(newClasses)
    }
    reader.readAsArrayBuffer(file)
    e.target.value = ''
  }

  if (pendingUpload) {
    const totalPending = pendingUpload.reduce((sum, c) => sum + c.students.length, 0)
    return (
      <SchoolHome backTo={`/schools/${schoolId}/sources`} content={
        <div style={{
          background: 'var(--color-bg-card)', borderRadius: 'var(--radius)',
          border: '1px solid var(--color-accent)', padding: '20px', marginBottom: '16px',
        }}>
          <p style={{ fontSize: '16px', fontWeight: 800, textAlign: 'center', marginBottom: '16px', color: 'var(--color-accent)' }}>
            {pendingUpload.length} כיתות | {totalPending} תלמידים
          </p>
          {pendingUpload.map(c => (
            <div key={c.name} style={{
              display: 'flex', justifyContent: 'space-between', padding: '8px 0',
              borderBottom: '1px solid var(--color-border)', fontSize: '13px',
            }}>
              <span style={{ fontWeight: 700 }}>כיתה {c.name}</span>
              <span style={{ color: 'var(--color-text-secondary)' }}>{c.students.length} תלמידים</span>
            </div>
          ))}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '16px' }}>
            <button onClick={() => { update(pendingUpload); setPendingUpload(null) }} style={{
              background: 'var(--color-success)', color: '#fff', border: 'none',
              borderRadius: 'var(--radius-sm)', padding: '12px 32px', fontSize: '15px', fontWeight: 700, cursor: 'pointer',
            }}>אישור והעלאה</button>
            <button onClick={() => setPendingUpload(null)} style={{
              background: 'transparent', color: 'var(--color-text-secondary)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)', padding: '12px 32px', fontSize: '15px', fontWeight: 700, cursor: 'pointer',
            }}>ביטול</button>
          </div>
        </div>
      } />
    )
  }

  return (
    <SchoolHome backTo={`/schools/${schoolId}/sources`} content={
      <>
        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', textAlign: 'center', marginBottom: '16px' }}>
          {classes.length} כיתות | {totalStudents} תלמידים
        </p>

        {/* Classes grid */}
        {classes.length > 0 && (
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
            gap: '10px', marginBottom: '16px',
          }}>
            {classes.map(c => (
              <button
                key={c.name}
                onClick={() => setExpandedClass(expandedClass === c.name ? null : c.name)}
                style={{
                  background: expandedClass === c.name ? 'rgba(77, 166, 232, 0.15)' : 'var(--color-bg-card)',
                  border: `1px solid ${expandedClass === c.name ? 'var(--color-accent)' : 'var(--color-border)'}`,
                  borderRadius: 'var(--radius)',
                  padding: '16px 8px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.2s ease',
                }}
              >
                <p style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-accent)', margin: '0 0 4px', textShadow: '0 0 8px rgba(77, 166, 232, 0.6)' }}>
                  {c.name}
                </p>
                <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: 0 }}>
                  {c.students.length} תלמידים
                </p>
              </button>
            ))}
          </div>
        )}

        {/* Expanded class - student list */}
        {expandedClass && (() => {
          const cls = classes.find(c => c.name === expandedClass)
          if (!cls) return null
          return (
            <div style={{
              background: 'rgba(255, 255, 255, 0.06)',
              borderRadius: 'var(--radius)',
              border: '2px solid var(--color-accent)',
              overflow: 'hidden',
              marginBottom: '16px',
            }}>
              <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--color-border)', background: 'rgba(77, 166, 232, 0.05)', textAlign: 'center' }}>
                <span style={{ fontSize: '17px', fontWeight: 800, color: 'var(--color-accent)' }}>
                  כיתה {cls.name} ({cls.students.length})
                </span>
              </div>
              {cls.students.map(student => (
                <div key={student} style={{
                  display: 'flex', alignItems: 'center', padding: '10px 14px',
                  borderBottom: '1px solid var(--color-border)', fontSize: '13px',
                }}>
                  <span style={{ flex: 1 }}>{student}</span>
                  <button onClick={() => removeStudent(cls.name, student)} style={{
                    background: 'none', border: 'none', color: 'var(--color-danger)',
                    fontSize: '18px', cursor: 'pointer', padding: '0 8px', lineHeight: 1,
                  }}>✕</button>
                </div>
              ))}
            </div>
          )
        })()}

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => fileInputRef.current?.click()} style={{
            background: 'var(--color-accent)', color: '#fff', border: 'none',
            borderRadius: 'var(--radius-sm)', padding: '12px 24px', fontSize: '14px', fontWeight: 700, cursor: 'pointer',
          }}>העלאת אקסל</button>
          <button onClick={handleDownloadTemplate} style={{
            background: 'transparent', color: 'var(--color-accent)', border: '1px solid var(--color-accent)',
            borderRadius: 'var(--radius-sm)', padding: '12px 24px', fontSize: '14px', fontWeight: 700, cursor: 'pointer',
          }}>הורד תבנית</button>
        </div>
        <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" style={{ display: 'none' }} onChange={handleUploadExcel} />
      </>
    } />
  )
}
