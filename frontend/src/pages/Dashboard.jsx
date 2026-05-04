import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getMyListings } from '../api/listings'
import { getMyClaims } from '../api/claims'
import api from '../api/axiosInstance'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { PlusCircle, List, ArrowRight, Package, CheckCircle, Clock } from 'lucide-react'

function StatCard({ icon, label, value, color = 'text-brand-400' }) {
  return (
    <div className="card flex items-center gap-4">
      <div className={`text-3xl ${color}`}>{icon}</div>
      <div>
        <div className={`text-2xl font-bold ${color}`}>{value}</div>
        <div className="text-xs text-gray-500">{label}</div>
      </div>
    </div>
  )
}

function DonorDashboard({ user }) {
  const { data: listings = [], isLoading } = useQuery({ queryKey: ['myListings'], queryFn: () => getMyListings().then(r => r.data) })
  const active = listings.filter(l => l.status === 'available').length
  const claimed = listings.filter(l => l.status === 'claimed').length

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={<Package />} label="Active Listings" value={active} />
        <StatCard icon={<CheckCircle />} label="Claimed" value={claimed} color="text-amber-400" />
        <StatCard icon={<List />} label="Total Listings" value={listings.length} color="text-blue-400" />
      </div>
      <div className="flex gap-3">
        <Link to="/add-listing" className="btn-primary"><PlusCircle className="w-4 h-4" /> Post Food</Link>
        <Link to="/my-listings" className="btn-secondary"><List className="w-4 h-4" /> My Listings</Link>
      </div>
      <div className="card">
        <h3 className="text-sm font-semibold text-gray-300 mb-3">Recent Listings</h3>
        {isLoading ? <LoadingSpinner /> : listings.slice(0, 5).map(l => (
          <div key={l.id} className="flex items-center justify-between py-2.5 border-b border-gray-800 last:border-0">
            <div>
              <p className="text-sm font-medium text-gray-200">{l.food_type}</p>
              <p className="text-xs text-gray-500">{l.quantity} {l.quantity_unit}</p>
            </div>
            <span className={l.status === 'available' ? 'badge-green' : l.status === 'claimed' ? 'badge-yellow' : 'badge-gray'}>
              {l.status}
            </span>
          </div>
        ))}
        {!isLoading && listings.length === 0 && (
          <p className="text-gray-500 text-sm text-center py-4">No listings yet. <Link to="/add-listing" className="text-brand-400">Post your first food listing</Link></p>
        )}
      </div>
    </div>
  )
}

function ReceiverDashboard({ user }) {
  const { data: claims = [] } = useQuery({ queryKey: ['myClaims'], queryFn: () => getMyClaims().then(r => r.data) })
  const active = claims.filter(c => c.status === 'pending').length
  const completed = claims.filter(c => c.status === 'completed').length

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={<Clock />} label="Active Claims" value={active} />
        <StatCard icon={<CheckCircle />} label="Completed" value={completed} color="text-amber-400" />
        <StatCard icon={<List />} label="Total Claims" value={claims.length} color="text-blue-400" />
      </div>
      <div className="flex gap-3">
        <Link to="/browse" className="btn-primary">🍽️ Browse Nearby Food</Link>
        <Link to="/my-claims" className="btn-secondary"><List className="w-4 h-4" /> My Claims</Link>
      </div>
      <div className="card">
        <h3 className="text-sm font-semibold text-gray-300 mb-3">Recent Claims</h3>
        {claims.slice(0, 5).map(c => (
          <div key={c.id} className="flex items-center justify-between py-2.5 border-b border-gray-800 last:border-0">
            <p className="text-sm text-gray-200">{c.listing_id.slice(0, 8)}...</p>
            <span className={c.status === 'completed' ? 'badge-green' : c.status === 'pending' ? 'badge-yellow' : 'badge-gray'}>
              {c.status}
            </span>
          </div>
        ))}
        {claims.length === 0 && (
          <p className="text-gray-500 text-sm text-center py-4">No claims yet. <Link to="/browse" className="text-brand-400">Browse available food</Link></p>
        )}
      </div>
    </div>
  )
}

function AdminDashboard() {
  const { data: stats } = useQuery({ queryKey: ['adminStats'], queryFn: () => api.get('/api/admin/stats').then(r => r.data) })
  if (!stats) return <LoadingSpinner />
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: stats.total_users, icon: '👥', color: 'text-brand-400' },
          { label: 'Total Listings', value: stats.total_listings, icon: '📋', color: 'text-blue-400' },
          { label: 'Active Listings', value: stats.active_listings, icon: '✅', color: 'text-brand-400' },
          { label: 'Food Saved (kg)', value: `${stats.total_kg_saved}kg`, icon: '🌿', color: 'text-amber-400' },
        ].map(s => <StatCard key={s.label} icon={s.icon} label={s.label} value={s.value} color={s.color} />)}
      </div>
      <Link to="/admin" className="btn-primary inline-flex">Go to Admin Panel <ArrowRight className="w-4 h-4" /></Link>
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  if (!user) return <LoadingSpinner />
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Welcome back, {user.name}! 👋</h1>
        <p className="text-gray-400 text-sm mt-1 capitalize">{user.role} Dashboard</p>
      </div>
      {user.role === 'donor'    && <DonorDashboard user={user} />}
      {user.role === 'receiver' && <ReceiverDashboard user={user} />}
      {user.role === 'admin'    && <AdminDashboard />}
    </div>
  )
}
