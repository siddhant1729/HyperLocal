import { Link } from 'react-router-dom'
import { Leaf, ArrowRight, Zap, MapPin, Bell } from 'lucide-react'
import Navbar from '../components/common/Navbar'

const stats = [
  { value: '10,000+', label: 'Meals Rescued' },
  { value: '500+', label: 'Active Donors' },
  { value: '1,200+', label: 'Happy Receivers' },
]

const steps = [
  { icon: '🍛', title: 'Donors List Food', desc: 'Restaurants, cafes, and homes post surplus food with pickup details and expiry time.' },
  { icon: '📍', title: 'Nearby Match', desc: 'Our platform instantly notifies receivers within your radius about fresh, available food.' },
  { icon: '🤝', title: 'Claim & Pickup', desc: 'Receivers claim food, coordinate pickup, and rate the experience — zero waste!' },
]

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-4 overflow-hidden">
        {/* Gradient orbs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-40 right-1/4 w-80 h-80 bg-amber-500/8 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-brand-500/30 text-brand-400 text-sm font-medium mb-6 animate-fade-in">
            <Leaf className="w-4 h-4" /> Reducing food waste, one meal at a time
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-tight mb-6 animate-slide-up">
            Connect{' '}
            <span className="bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text text-transparent">
              Surplus Food
            </span>
            {' '}with Those Who Need It
          </h1>

          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            FoodRescue is a hyper-local platform that connects food donors — restaurants, cafes, hostels — with students, NGOs, and individuals in real time.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register?role=donor" className="btn-primary py-3.5 px-8 text-base">
              Donate Food <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/register?role=receiver" className="btn-secondary py-3.5 px-8 text-base">
              Find Food Nearby
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="max-w-3xl mx-auto mt-20 grid grid-cols-3 gap-6">
          {stats.map((s) => (
            <div key={s.label} className="glass p-6 text-center">
              <div className="text-3xl font-extrabold text-brand-400">{s.value}</div>
              <div className="text-sm text-gray-400 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-4 border-t border-gray-800">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">How It Works</h2>
            <p className="text-gray-400">Three simple steps to rescue food and feed communities</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <div key={i} className="card text-center hover:border-brand-500/40 transition-all duration-300 group">
                <div className="text-5xl mb-4">{s.icon}</div>
                <div className="text-xs text-brand-400 font-semibold mb-2">STEP {i + 1}</div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-brand-400 transition-colors">{s.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4 border-t border-gray-800 bg-gray-900/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-white mb-3">Built for Real Impact</h2>
            <p className="text-gray-400">Everything you need to rescue food in your community</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: <MapPin className="w-6 h-6 text-brand-400" />, title: 'Hyper-Local', desc: 'Find food within a customizable radius. Nearest listings shown first.' },
              { icon: <Zap className="w-6 h-6 text-amber-400" />, title: 'Real-Time', desc: 'Listings update in real time. Countdown timers show time left before food expires.' },
              { icon: <Bell className="w-6 h-6 text-blue-400" />, title: 'Smart Alerts', desc: 'Get notified instantly when food is available near you or when your listing is claimed.' },
            ].map((f) => (
              <div key={f.title} className="card">
                <div className="mb-3">{f.icon}</div>
                <h3 className="font-semibold text-white mb-1">{f.title}</h3>
                <p className="text-gray-400 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 border-t border-gray-800">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Make a Difference?</h2>
          <p className="text-gray-400 mb-8">Join thousands of donors and receivers working together to reduce food waste.</p>
          <Link to="/register" className="btn-primary py-3.5 px-10 text-base">
            Get Started Free <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      <footer className="py-8 border-t border-gray-800 text-center text-gray-500 text-sm">
        © 2025 FoodRescue. Built to reduce food waste, one meal at a time. 🌿
      </footer>
    </div>
  )
}
