export const formatCurrencyARS = (value: number) => {
  try {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 2 }).format(value)
  } catch {
    return `$ ${value.toFixed(2)}`
  }
}

export const formatDateTimeAR = (iso: string | number | Date) => {
  const dt = typeof iso === 'string' || typeof iso === 'number' ? new Date(iso) : iso
  try {
    // America/Argentina/Buenos_Aires (UTC-03:00)
    return new Intl.DateTimeFormat('es-AR', {
      timeZone: 'America/Argentina/Buenos_Aires',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(dt)
  } catch {
    return dt.toLocaleString('es-AR')
  }
}
