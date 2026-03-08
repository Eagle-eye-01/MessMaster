import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import api from '../../api/axios'
import Badge from '../../components/ui/Badge'

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-card border border-border rounded-lg p-3 text-xs">
      <p className="text-primary font-semibold">{payload[0]?.payload?._id}</p>
      <p className="text-orange">Waste: {payload[0]?.value?.toFixed(1)} kg</p>
    </div>
  )
}

const getRisk = (waste) => {
  if (waste > 15) return { label: 'CRITICAL', color: 'red' }
  if (waste > 10) return { label: 'HIGH', color: 'orange' }
  if (waste > 5) return { label: 'MODERATE', color: 'yellow' }
  return { label: 'LOW', color: 'green' }
}

const BAR_COLORS = ['#ff3d5a', '#ff6b2b', '#fbbf24', '#00e676', '#38bdf8', '#a78bfa', '#2dd4bf', '#ff6b2b', '#ff3d5a', '#fbbf24']

export default function MenuAnalysis() {
  const { data: byMenu = [] } = useQuery({
    queryKey: ['by-menu'],
    queryFn: () => api.get('/waste-logs/by-menu').then(r => r.data),
  })

  const { data: correlation = [] } = useQuery({
    queryKey: ['correlation'],
    queryFn: () => api.get('/menu-items/correlation').then(r => r.data),
  })

  const chartData = byMenu.map((d, i) => ({ ...d, fill: BAR_COLORS[i % BAR_COLORS.length] }))

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-primary">Menu Analysis</h1>
        <p className="text-muted text-sm">Waste correlation by menu item</p>
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="font-semibold text-primary mb-4">Total Waste by Menu Item (kg)</h3>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={chartData} layout="vertical" margin={{ left: 120, right: 20 }}>
            <XAxis type="number" stroke="#4a5f7a" tick={{ fontSize: 11 }} />
            <YAxis type="category" dataKey="_id" stroke="#4a5f7a" tick={{ fontSize: 11 }} width={120} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="totalWaste" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {byMenu.slice(0, 6).map((item) => {
          const risk = getRisk(item.totalWaste)
          return (
            <div key={item._id} className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-start justify-between mb-2">
                <p className="font-semibold text-primary text-sm">{item._id}</p>
                <Badge color={risk.color}>{risk.label}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-3">
                <div>
                  <p className="text-xs text-muted">Total Waste</p>
                  <p className="font-display text-lg text-orange">{item.totalWaste?.toFixed(1)} kg</p>
                </div>
                <div>
                  <p className="text-xs text-muted">Log Count</p>
                  <p className="font-display text-lg text-blue">{item.count}</p>
                </div>
              </div>
              <div className="mt-3 bg-surface rounded-full h-1.5">
                <div className="h-1.5 rounded-full" style={{ width: `${Math.min((item.totalWaste / 50) * 100, 100)}%`, background: risk.color === 'red' ? '#ff3d5a' : risk.color === 'orange' ? '#ff6b2b' : '#00e676' }} />
              </div>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}
