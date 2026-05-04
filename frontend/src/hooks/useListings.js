import { useQuery } from '@tanstack/react-query'
import { getNearbyListings, getAllListings, getMyListings, getListing } from '../api/listings'

export function useNearbyListings(params) {
  return useQuery({
    queryKey: ['nearby', params],
    queryFn: () => (params ? getNearbyListings(params) : getAllListings()).then(r => r.data),
    enabled: true,
    refetchInterval: 30_000,
    staleTime: 20_000,
  })
}

export function useMyListings() {
  return useQuery({
    queryKey: ['myListings'],
    queryFn: () => getMyListings().then(r => r.data),
    refetchInterval: 30_000,
  })
}

export function useListing(id) {
  return useQuery({
    queryKey: ['listing', id],
    queryFn: () => getListing(id).then(r => r.data),
    enabled: !!id,
  })
}
