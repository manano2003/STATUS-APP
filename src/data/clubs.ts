export interface Club {
  id: string
  name: string
  children: string[]
  staff: string[]
}

// PII removed from source code — data comes from localStorage (Excel upload) or DB
export const clubs: Club[] = []

export function getClubById(id: string): Club | undefined {
  return clubs.find(c => c.id === id)
}
