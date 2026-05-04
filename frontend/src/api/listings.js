import api from './axiosInstance'

export const createListing = (data) => api.post('/api/listings/', data)
export const getNearbyListings = (params) => api.get('/api/listings/nearby', { params })
export const getAllListings = (params) => api.get('/api/listings/', { params })
export const getMyListings = () => api.get('/api/listings/my')
export const getListing = (id) => api.get(`/api/listings/${id}`)
export const updateListing = (id, data) => api.put(`/api/listings/${id}`, data)
export const deleteListing = (id) => api.delete(`/api/listings/${id}`)
export const expireListing = (id) => api.patch(`/api/listings/${id}/expire`)
