import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getMyListings, deleteListing } from '../api/listings'
import { useNotifications } from '../context/NotificationContext'
import ListingDetail from '../components/listings/ListingDetail'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { PlusCircle, Trash2, Eye } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'

export default function MyListings() {
  const { addToast } = useNotifications()
  const qc = useQueryClient()
  const [selected, setSelected] = useState(null)

  const { data: listings = [], isLoading } = useQuery({
    queryKey: ['myListings'],
    queryFn: () => getMyListings().then(r => r.data),
    refetchInterval: 30_000,
  })

  const deleteMutation = useMutation({
    mutationFn: deleteListing,
    onSuccess: () => { addToast('Listing removed', 'success'); qc.invalidateQueries(['myListings']) },
    onError: () => addToast('Failed to remove listing', 'error'),
  })

  const statusBadge = { available: 'badge-green', claimed: 'badge-yellow', expired: 'badge-gray', deleted: 'badge-red' }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">My Listings</h1>
          <p className="text-gray-400 text-sm mt-1">Manage your food donations</p>
        </div>
        <Link to="/add-listing" className="btn-primary">
          <PlusCircle className="w-4 h-4" /> Add Food
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
      ) : listings.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-5xl mb-4">🍽️</div>
          <p className="text-gray-400 mb-4">You haven't posted any listings yet</p>
          <Link to="/add-listing" className="btn-primary">Post Your First Listing</Link>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 border-b border-gray-800 text-left">
                  <th className="pb-3 font-medium">Food</th>
                  <th className="pb-3 font-medium">Quantity</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Expires</th>
                  <th className="pb-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {listings.map((l) => (
                  <tr key={l.id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="py-3">
                      <p className="font-medium text-gray-200">{l.food_type}</p>
                      <p className="text-xs text-gray-500">{l.food_category}</p>
                    </td>
                    <td className="py-3 text-gray-400">{l.quantity} {l.quantity_unit}</td>
                    <td className="py-3">
                      <span className={statusBadge[l.status] || 'badge-gray'}>{l.status}</span>
                    </td>
                    <td className="py-3 text-gray-400 text-xs">
                      {formatDistanceToNow(new Date(l.expires_at), { addSuffix: true })}
                    </td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        <button onClick={() => setSelected(l)} className="p-1.5 text-gray-400 hover:text-brand-400 transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        {l.status === 'available' && (
                          <button onClick={() => deleteMutation.mutate(l.id)} className="p-1.5 text-gray-400 hover:text-red-400 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {selected && <ListingDetail listing={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
