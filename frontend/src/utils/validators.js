export function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function validatePassword(password) {
  return password && password.length >= 6
}

export function validateLatitude(lat) {
  const n = Number(lat)
  return !isNaN(n) && n >= -90 && n <= 90
}

export function validateLongitude(lng) {
  const n = Number(lng)
  return !isNaN(n) && n >= -180 && n <= 180
}

export function validateListingForm(form) {
  const errors = {}
  if (!form.food_type?.trim()) errors.food_type = 'Food name is required'
  if (!form.quantity || Number(form.quantity) <= 0) errors.quantity = 'Quantity must be greater than 0'
  if (!form.pickup_address?.trim()) errors.pickup_address = 'Pickup address is required'
  if (!validateLatitude(form.latitude)) errors.latitude = 'Valid latitude required (-90 to 90)'
  if (!validateLongitude(form.longitude)) errors.longitude = 'Valid longitude required (-180 to 180)'
  if (!form.expires_at) errors.expires_at = 'Expiry time is required'
  else if (new Date(form.expires_at) <= new Date()) errors.expires_at = 'Expiry must be in the future'
  return errors
}
