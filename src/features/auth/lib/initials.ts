export function initialsFromEmail(email: string) {
  const name = email.split('@')[0] ?? ''
  const parts = name.split(/[._-]+/).filter(Boolean)
  const initials = parts.length > 1 ? parts.slice(0, 2).map((part) => part[0]) : name.slice(0, 2).split('')
  return initials.join('').toUpperCase()
}
