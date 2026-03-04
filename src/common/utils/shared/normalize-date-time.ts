export function normalizeDateTime(value?: string | null) {
  if (value === undefined || value === null) {
    return value
  }

  const isoDateTime = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? `${value}T00:00:00.000Z`
    : value

  return new Date(isoDateTime)
}
