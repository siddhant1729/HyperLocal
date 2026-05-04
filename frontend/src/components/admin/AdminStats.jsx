import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#6366f1']

export default function AdminStats({ stats }) {
  const barData = [
    { name: 'Users', value: stats.total_users },
    { name: 'Listings', value: stats.total_listings },
    { name: 'Active', value: stats.active_listings },
    { name: 'Done', value: stats.completed_transactions },
  ]
  const pieData = [
    { name: 'Active', value: stats.active_listings },
    { name: 'Completed', value: stats.completed_transactions },
    { name: 'Other', value: Math.max(0, stats.total_listings - stats.active_listings - stats.completed_transactions) },
  ]

  return (
    <div className="space-y-6">
      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: stats.total_users, emoji: '👥' },
          { label: 'Total Listings', value: stats.total_listings, emoji: '📋' },
          { label: 'Active Listings', value: stats.active_listings, emoji: '✅' },
          { label: 'Food Saved (kg)', value: `${stats.total_kg_saved} kg`, emoji: '🌿' },
        ].map((k) => (
          <div key={k.label} className="card text-center">
            <div className="text-3xl mb-1">{k.emoji}</div>
            <div className="text-2xl font-bold text-brand-400">{k.value}</div>
            <div className="text-xs text-gray-500 mt-1">{k.label}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-300 mb-4">Overview</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData}>
              <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#111827', border: '1px solid #1f2937', borderRadius: '8px', color: '#e5e7eb' }} />
              <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-300 mb-4">Listing Status</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#111827', border: '1px solid #1f2937', borderRadius: '8px', color: '#e5e7eb' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
