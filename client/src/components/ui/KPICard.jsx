import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

const useCountUp = (target, duration = 1500) => {
  const [count, setCount] = useState(0)
  useEffect(() => {
    let start = 0
    const step = target / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= target) { setCount(target); clearInterval(timer) }
      else setCount(parseFloat(start.toFixed(1)))
    }, 16)
    return () => clearInterval(timer)
  }, [target, duration])
  return count
}

export default function KPICard({ label, value, sub, color = '#00e676', icon, prefix = '', suffix = '' }) {
  const numericValue = parseFloat(String(value).replace(/[^0-9.]/g, '')) || 0
  const animated = useCountUp(numericValue)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative bg-card border border-border rounded-xl p-5 overflow-hidden"
    >
      <div className="absolute top-3 right-3 text-4xl opacity-10">{icon}</div>
      <p className="text-xs text-muted uppercase tracking-wider mb-2">{label}</p>
      <p className="font-display text-3xl font-bold count-up" style={{ color }}>
        {prefix}{animated.toLocaleString()}{suffix}
      </p>
      {sub && <p className="text-xs text-muted mt-1">{sub}</p>}
      <div className="absolute bottom-0 left-0 h-0.5 w-1/3" style={{ background: color }} />
    </motion.div>
  )
}
