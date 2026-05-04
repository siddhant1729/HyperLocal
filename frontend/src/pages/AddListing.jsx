import AddListingForm from '../components/listings/AddListingForm'
import { useNavigate } from 'react-router-dom'

export default function AddListing() {
  const navigate = useNavigate()
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Post a Food Listing</h1>
        <p className="text-gray-400 text-sm mt-1">Share surplus food with people in your area</p>
      </div>
      <div className="card">
        <AddListingForm onSuccess={() => navigate('/my-listings')} />
      </div>
    </div>
  )
}
