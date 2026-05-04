import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Leaf, Store, Users } from 'lucide-react'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const defaultRole = params.get('role') || 'receiver'

  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', role: defaultRole })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return }
    setError('')
    setLoading(true)
    try {
      await register(form)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-brand-400 font-bold text-2xl">
            <Leaf className="w-7 h-7" /> FoodRescue
          </Link>
          <h1 className="text-2xl font-bold text-white mt-4">Create your account</h1>
          <p className="text-gray-400 text-sm mt-1">Join the food rescue community</p>
        </div>

        <div className="card">
          {/* Role selector */}
          <div className="mb-6">
            <label className="label">I want to</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { val: 'donor', icon: <Store className="w-5 h-5" />, label: 'Donate Food', sub: 'Restaurant / Cafe / Home' },
                { val: 'receiver', icon: <Users className="w-5 h-5" />, label: 'Find Food', sub: 'Student / NGO / Individual' },
              ].map((r) => (
                <button type="button" key={r.val} onClick={() => set('role', r.val)}
                  className={`p-3 rounded-lg border text-left transition-all ${form.role === r.val ? 'border-brand-500 bg-brand-500/20' : 'border-gray-700 hover:border-gray-600'}`}>
                  <div className={`mb-1 ${form.role === r.val ? 'text-brand-400' : 'text-gray-400'}`}>{r.icon}</div>
                  <div className={`text-sm font-semibold ${form.role === r.val ? 'text-brand-400' : 'text-gray-200'}`}>{r.label}</div>
                  <div className="text-xs text-gray-500">{r.sub}</div>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input id="name" type="text" className="input" placeholder="Your name" required
                value={form.name} onChange={(e) => set('name', e.target.value)} />
            </div>
            <div>
              <label className="label">Email</label>
              <input id="email" type="email" className="input" placeholder="you@example.com" required
                value={form.email} onChange={(e) => set('email', e.target.value)} />
            </div>
            <div>
              <label className="label">Phone (optional)</label>
              <input id="phone" type="tel" className="input" placeholder="+91 98765 43210"
                value={form.phone} onChange={(e) => set('phone', e.target.value)} />
            </div>
            <div>
              <label className="label">Password</label>
              <input id="password" type="password" className="input" placeholder="Min. 6 characters" required
                value={form.password} onChange={(e) => set('password', e.target.value)} />
            </div>

            {error && (
              <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                {error}
              </div>
            )}

            <button id="register-btn" type="submit" disabled={loading} className="btn-primary w-full py-3 text-base mt-2">
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
