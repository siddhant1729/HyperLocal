import { useState } from 'react'
import { Search, UserX } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../api/axiosInstance'
import { useNotifications } from '../../context/NotificationContext'
import { format } from 'date-fns'

export default function UserTable({ users }) {
  const [search, setSearch] = useState('')
  const { addToast } = useNotifications()
  const qc = useQueryClient()

  const deactivate = useMutation({
    mutationFn: (id) => api.delete(`/api/admin/users/${id}`),
    onSuccess: () => { addToast('User deactivated', 'success'); qc.invalidateQueries(['adminUsers']) },
    onError: () => addToast('Failed to deactivate', 'error'),
  })

  const filtered = users.filter(
    (u) => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input className="input pl-9" placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-500 text-left border-b border-gray-800">
              <th className="pb-2 font-medium">Name</th>
              <th className="pb-2 font-medium">Email</th>
              <th className="pb-2 font-medium">Role</th>
              <th className="pb-2 font-medium">Status</th>
              <th className="pb-2 font-medium">Joined</th>
              <th className="pb-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {filtered.map((u) => (
              <tr key={u.id} className="hover:bg-gray-800/50 transition-colors">
                <td className="py-3 font-medium text-gray-200">{u.name}</td>
                <td className="py-3 text-gray-400">{u.email}</td>
                <td className="py-3">
                  <span className={u.role === 'donor' ? 'badge-green' : u.role === 'admin' ? 'badge-blue' : 'badge-yellow'}>
                    {u.role}
                  </span>
                </td>
                <td className="py-3">
                  <span className={u.is_active ? 'badge-green' : 'badge-red'}>
                    {u.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="py-3 text-gray-400 text-xs">{format(new Date(u.created_at), 'PP')}</td>
                <td className="py-3">
                  {u.is_active && (
                    <button onClick={() => deactivate.mutate(u.id)}
                      className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition-colors">
                      <UserX className="w-3.5 h-3.5" /> Deactivate
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="text-center text-gray-500 text-sm py-8">No users found</p>
        )}
      </div>
    </div>
  )
}
