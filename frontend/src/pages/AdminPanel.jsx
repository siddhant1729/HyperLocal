import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../api/axiosInstance'
import { useNotifications } from '../context/NotificationContext'
import AdminStats from '../components/admin/AdminStats'
import UserTable from '../components/admin/UserTable'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { Trash2, RefreshCw } from 'lucide-react'
import { format } from 'date-fns'
import { useState } from 'react'

const TABS = ['Overview', 'Users', 'Listings', 'Transactions']

export default function AdminPanel() {
  const [tab, setTab] = useState('Overview')
  const { addToast } = useNotifications()
  const qc = useQueryClient()

  const { data: stats } = useQuery({ queryKey: ['adminStats'], queryFn: () => api.get('/api/admin/stats').then(r => r.data) })
  const { data: users = [] } = useQuery({ queryKey: ['adminUsers'], queryFn: () => api.get('/api/admin/users').then(r => r.data), enabled: tab === 'Users' })
  const { data: listings = [] } = useQuery({ queryKey: ['adminListings'], queryFn: () => api.get('/api/admin/listings').then(r => r.data), enabled: tab === 'Listings' })
  const { data: txns = [] } = useQuery({ queryKey: ['adminTxns'], queryFn: () => api.get('/api/admin/transactions').then(r => r.data), enabled: tab === 'Transactions' })

  const forceDelete = useMutation({
    mutationFn: (id) => api.delete(`/api/admin/listings/${id}`),
    onSuccess: () => { addToast('Listing removed', 'success'); qc.invalidateQueries(['adminListings']) },
  })

  const statusBadge = { available: 'badge-green', claimed: 'badge-yellow', expired: 'badge-gray', deleted: 'badge-red' }
  const txnBadge = { pending: 'badge-yellow', confirmed: 'badge-blue', completed: 'badge-green', cancelled: 'badge-red' }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
        <p className="text-gray-400 text-sm mt-1">Platform management and analytics</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-900 p-1 rounded-xl w-fit">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t ? 'bg-brand-500 text-white' : 'text-gray-400 hover:text-white'}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'Overview' && (
        stats ? <AdminStats stats={stats} /> : <LoadingSpinner />
      )}

      {tab === 'Users' && (
        users.length > 0 ? <UserTable users={users} /> : <LoadingSpinner />
      )}

      {tab === 'Listings' && (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 border-b border-gray-800 text-left">
                <th className="pb-3">Food</th><th className="pb-3">Donor</th><th className="pb-3">Status</th>
                <th className="pb-3">Expires</th><th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {listings.map((l) => (
                <tr key={l.id} className="hover:bg-gray-800/30 transition-colors">
                  <td className="py-3 text-gray-200">{l.food_type}</td>
                  <td className="py-3 text-gray-400">{l.donor_name}</td>
                  <td className="py-3"><span className={statusBadge[l.status] || 'badge-gray'}>{l.status}</span></td>
                  <td className="py-3 text-gray-400 text-xs">{format(new Date(l.expires_at), 'PP')}</td>
                  <td className="py-3">
                    {l.status !== 'deleted' && (
                      <button onClick={() => forceDelete.mutate(l.id)}
                        className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" /> Remove
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'Transactions' && (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 border-b border-gray-800 text-left">
                <th className="pb-3">ID</th><th className="pb-3">Status</th>
                <th className="pb-3">Claimed At</th><th className="pb-3">Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {txns.map((t) => (
                <tr key={t.id} className="hover:bg-gray-800/30 transition-colors">
                  <td className="py-3 font-mono text-xs text-gray-400">{t.id.slice(0, 12)}...</td>
                  <td className="py-3"><span className={txnBadge[t.status] || 'badge-gray'}>{t.status}</span></td>
                  <td className="py-3 text-gray-400 text-xs">{format(new Date(t.claimed_at), 'PP p')}</td>
                  <td className="py-3 text-amber-400">{t.feedback_rating ? `⭐ ${t.feedback_rating}/5` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
