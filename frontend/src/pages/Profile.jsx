import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useAuth } from '../context/AuthContext'
import { updateMe } from '../api/auth'
import { useNotifications } from '../context/NotificationContext'
import { User, Save } from 'lucide-react'

export default function Profile() {
  const { user, updateUser } = useAuth()
  const { addToast } = useNotifications()
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    latitude: user?.latitude || '',
    longitude: user?.longitude || '',
  })

  const mutation = useMutation({
    mutationFn: () => updateMe({
      name: form.name,
      phone: form.phone || null,
      latitude: form.latitude ? Number(form.latitude) : null,
      longitude: form.longitude ? Number(form.longitude) : null,
    }),
    onSuccess: ({ data }) => {
      updateUser(data)
      addToast('Profile updated successfully!', 'success')
    },
    onError: () => addToast('Failed to update profile', 'error'),
  })

  const useMyLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((f) => ({ ...f, latitude: pos.coords.latitude.toString(), longitude: pos.coords.longitude.toString() }))
        addToast('Location detected!', 'success')
      },
      () => addToast('Could not get location', 'error')
    )
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-brand-500/20 flex items-center justify-center">
          <User className="w-6 h-6 text-brand-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">{user?.name}</h1>
          <p className="text-sm text-gray-400 capitalize">{user?.role} · {user?.email}</p>
        </div>
      </div>

      <div className="card space-y-4">
        <div>
          <label className="label">Full Name</label>
          <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div>
          <label className="label">Phone</label>
          <input className="input" placeholder="+91 98765 43210" value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </div>
        <div>
          <label className="label">Your Location</label>
          <div className="grid grid-cols-2 gap-3">
            <input className="input" placeholder="Latitude" value={form.latitude}
              onChange={(e) => setForm({ ...form, latitude: e.target.value })} />
            <input className="input" placeholder="Longitude" value={form.longitude}
              onChange={(e) => setForm({ ...form, longitude: e.target.value })} />
          </div>
          <button type="button" onClick={useMyLocation}
            className="mt-2 text-xs text-brand-400 hover:text-brand-300 transition-colors">
            📍 Use my current location
          </button>
        </div>

        <button onClick={() => mutation.mutate()} disabled={mutation.isPending}
          className="btn-primary w-full py-3">
          <Save className="w-4 h-4" /> {mutation.isPending ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}
