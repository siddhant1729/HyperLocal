import api from './axiosInstance'

export const claimListing = (data) => api.post('/api/claims/', data)
export const getMyClaims = () => api.get('/api/claims/my')
export const cancelClaim = (id, data) => api.delete(`/api/claims/${id}`, { data })
export const completeClaim = (id, data) => api.put(`/api/claims/${id}/complete`, data)
export const getClaimsForListing = (listingId) => api.get(`/api/claims/listing/${listingId}`)
export const getNotifications = () => api.get('/api/notifications/')
export const markAllRead = () => api.post('/api/notifications/mark-read')
export const markOneRead = (id) => api.post(`/api/notifications/${id}/read`)
