export interface Kindergarten {
  id: string
  name: string
  children: string[]
  staff: string[]
}

// PII removed from source code — data comes from localStorage (Excel upload) or DB
export const kindergartens: Kindergarten[] = []

export function getKindergartenById(id: string): Kindergarten | undefined {
  return kindergartens.find(k => k.id === id)
}
