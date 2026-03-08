import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis } from 'recharts'
import api from '../../api/axios'
import useAuthStore from '../../store/useAuthStore'
import KPICard from '../../components/ui/KPICard'
import Badge from '../../components/ui/Badge'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-card border border-border rounded-lg p-3 text-xs">
      <p className="text-muted mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }}>{p.name}: {p.value} kg</p>
      ))}
    </div>
  )
}

export default function Overview() {
  const { user } = useAuthStore()

  const { data: kpis } = useQuery({
    queryKey: ['overview'],
    queryFn: () => api.get('/analytics/overview').then(r => r.data),
  })

  const { data: trend } = useQuery({
    queryKey: ['waste-trend'],
    queryFn: () => api.get('/analytics/waste-trend').then(r => r.data),
  })

  const { data: insights } = useQuery({
    queryKey: ['ai-insights'],
    queryFn: () => api.get('/analytics/ai-insights').then(r => r.data),
  })

  const { data: mealData } = useQuery({
    queryKey: ['meal-breakdown'],
    queryFn: () => api.get('/waste-logs/by-meal').then(r => r.data),
  })

  const trendFormatted = trend?.map(d => ({
    date: d._id?.slice(5),
    wasted: parseFloat(d.wastedKg?.toFixed(1) || 0),
    prepared: parseFloat(d.preparedKg?.toFixed(1) || 0),
  })) || []

  const radarData = ['Breakfast', 'Lunch', 'Snacks', 'Dinner'].map(meal => ({
    meal,
    waste: mealData?.find(m => m._id === meal)?.avgWaste?.toFixed(1) || 0,
  }))

  const severityColor = { critical: 'red', high: 'orange', moderate: 'yellow', info: 'blue' }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-primary">Overview</h1>
        <p className="text-muted text-sm">Last 7 days performance summary</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Total Waste" value={kpis?.totalWasteKg || 0} suffix=" kg" color="#ff6b2b" icon="🗑️" sub="This week" />
        <KPICard label="Cost Loss" value={kpis?.totalCostLoss || 0} prefix="₹" color="#ff3d5a" icon="💸" sub="This week" />
        <KPICard label="CO₂ Impact" value={kpis?.totalCo2Kg || 0} suffix=" kg" color="#a78bfa" icon="🌿" sub="Carbon equivalent" />
        <KPICard label="Oracle Accuracy" value={kpis?.oracleAccuracy || 98.2} suffix="%" color="#00e676" icon="🎯" sub="AI model precision" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5">
          <h3 className="font-semibold text-primary mb-4">Weekly Waste Trend</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trendFormatted}>
              <XAxis dataKey="date" stroke="#4a5f7a" tick={{ fontSize: 11 }} />
              <YAxis stroke="#4a5f7a" tick={{ fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="wasted" stroke="#ff6b2b" strokeWidth={2} dot={false} name="Wasted" />
              <Line type="monotone" dataKey="prepared" stroke="#38bdf8" strokeWidth={2} dot={false} strokeDasharray="4 4" name="Prepared" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-semibold text-primary mb-4">Waste by Meal</h3>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#1a2a3a" />
              <PolarAngleAxis dataKey="meal" tick={{ fill: '#4a5f7a', fontSize: 11 }} />
              <Radar dataKey="waste" fill="#a78bfa" fillOpacity={0.3} stroke="#a78bfa" strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI Insights */}
      <div>
        <h3 className="font-semibold text-primary mb-4">AI Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(insights || []).map((insight, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-card border border-border rounded-xl p-4 flex items-start gap-3"
            >
              <span className="text-2xl">{insight.icon}</span>
              <div>
                <Badge color={severityColor[insight.severity] || 'blue'} className="mb-1">{insight.severity?.toUpperCase()}</Badge>
                <p className="text-sm text-primary mt-1">{insight.text}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
