import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createListing } from '../../api/listings'
import { useNotifications } from '../../context/NotificationContext'
import { Leaf, Drumstick, Package } from 'lucide-react'

const DEFAULT = {
  food_type: '', food_category: 'veg', quantity: '', quantity_unit: 'servings',
  description: '', pickup_address: '', latitude: '', longitude: '',
  expires_at: '', image_url: '',
}

export default function AddListingForm({ onSuccess }) {
  const [form, setForm] = useState(DEFAULT)
  const [errors, setErrors] = useState({})
  const { addToast } = useNotifications()
  const qc = useQueryClient()

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const validate = () => {
    const e = {}
    if (!form.food_type.trim()) e.food_type = 'Required'
    if (!form.quantity || isNaN(form.quantity) || Number(form.quantity) <= 0) e.quantity = 'Must be > 0'
    if (!form.pickup_address.trim()) e.pickup_address = 'Required'
    if (!form.latitude || isNaN(form.latitude)) e.latitude = 'Valid latitude required'
    if (!form.longitude || isNaN(form.longitude)) e.longitude = 'Valid longitude required'
    if (!form.expires_at) e.expires_at = 'Required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const mutation = useMutation({
    mutationFn: () => createListing({
      ...form,
      quantity: Number(form.quantity),
      latitude: Number(form.latitude),
      longitude: Number(form.longitude),
      expires_at: new Date(form.expires_at).toISOString(),
    }),
    onSuccess: () => {
      addToast('Listing created! Nearby receivers have been notified.', 'success')
      qc.invalidateQueries(['myListings'])
      setForm(DEFAULT)
      onSuccess?.()
    },
    onError: (e) => addToast(e.response?.data?.detail || 'Failed to create listing', 'error'),
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validate()) mutation.mutate()
  }

  const useMyLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        set('latitude', pos.coords.latitude.toString())
        set('longitude', pos.coords.longitude.toString())
        addToast('Location detected!', 'success')
      },
      () => addToast('Could not get location', 'error')
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Food Type */}
      <div>
        <label className="label">Food Name *</label>
        <input className="input" placeholder="e.g. Biryani, Sandwiches, Rice & Dal" value={form.food_type}
          onChange={(e) => set('food_type', e.target.value)} />
        {errors.food_type && <p className="text-red-400 text-xs mt-1">{errors.food_type}</p>}
      </div>

      {/* Category */}
      <div>
        <label className="label">Category *</label>
        <div className="flex gap-3">
          {[['veg', <Leaf className="w-4 h-4" />, 'Vegetarian'], ['non-veg', <Drumstick className="w-4 h-4" />, 'Non-Veg'], ['vegan', <Leaf className="w-4 h-4" />, 'Vegan']].map(([val, icon, label]) => (
            <button type="button" key={val} onClick={() => set('food_category', val)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border text-sm font-medium transition-all ${form.food_category === val ? 'border-brand-500 bg-brand-500/20 text-brand-400' : 'border-gray-700 text-gray-400 hover:border-gray-600'}`}>
              {icon} {label}
            </button>
          ))}
        </div>
      </div>

      {/* Quantity */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Quantity *</label>
          <input type="number" className="input" placeholder="0" min="0.1" step="0.1" value={form.quantity}
            onChange={(e) => set('quantity', e.target.value)} />
          {errors.quantity && <p className="text-red-400 text-xs mt-1">{errors.quantity}</p>}
        </div>
        <div>
          <label className="label">Unit *</label>
          <select className="input" value={form.quantity_unit} onChange={(e) => set('quantity_unit', e.target.value)}>
            <option value="servings">Servings</option>
            <option value="kg">Kilograms</option>
            <option value="items">Items</option>
          </select>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="label">Description</label>
        <textarea className="input" rows={3} placeholder="Describe the food, dietary restrictions, preparation time..." value={form.description}
          onChange={(e) => set('description', e.target.value)} />
      </div>

      {/* Pickup Address */}
      <div>
        <label className="label">Pickup Address *</label>
        <input className="input" placeholder="Full address where food can be picked up" value={form.pickup_address}
          onChange={(e) => set('pickup_address', e.target.value)} />
        {errors.pickup_address && <p className="text-red-400 text-xs mt-1">{errors.pickup_address}</p>}
      </div>

      {/* Location */}
      <div>
        <label className="label">Coordinates *</label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <input className="input" placeholder="Latitude (e.g. 28.6139)" value={form.latitude}
              onChange={(e) => set('latitude', e.target.value)} />
            {errors.latitude && <p className="text-red-400 text-xs mt-1">{errors.latitude}</p>}
          </div>
          <div>
            <input className="input" placeholder="Longitude (e.g. 77.2090)" value={form.longitude}
              onChange={(e) => set('longitude', e.target.value)} />
            {errors.longitude && <p className="text-red-400 text-xs mt-1">{errors.longitude}</p>}
          </div>
        </div>
        <button type="button" onClick={useMyLocation}
          className="mt-2 text-xs text-brand-400 hover:text-brand-300 transition-colors">
          📍 Use my current location
        </button>
      </div>

      {/* Expiry */}
      <div>
        <label className="label">Available Until *</label>
        <input type="datetime-local" className="input" value={form.expires_at}
          min={new Date().toISOString().slice(0, 16)}
          onChange={(e) => set('expires_at', e.target.value)} />
        {errors.expires_at && <p className="text-red-400 text-xs mt-1">{errors.expires_at}</p>}
      </div>

      <button type="submit" disabled={mutation.isPending} className="btn-primary w-full py-3 text-base">
        {mutation.isPending ? 'Creating Listing...' : '🍛 Post Food Listing'}
      </button>
    </form>
  )
}
