export const issueChecklist = [
  'חלל פנימי מוכן לקליטת תושבים',
  'אור חיצוני',
  'אור במדרגות',
  'תאורה פנימית',
  'תאורת חירום',
  'מים בכיור',
  'שירותים',
  'ראוטר אינטרנט',
  'טלפון',
  'כיסאות',
  'מטף כיבוי',
  'תקינות דלתות',
  'תקינות חלונות',
  'שלט חיצוני לזיהוי המקלט',
  'ארון לציוד חירום',
  'תיק עזרה ראשונה',
]

export function getIssueChecklist(): string[] {
  try {
    const saved = localStorage.getItem('source_issues')
    if (saved) {
      const list = JSON.parse(saved)
      if (Array.isArray(list) && list.length > 0) return list
    }
  } catch {}
  return issueChecklist
}

export const MAINTENANCE_PHONE = '502632940'
