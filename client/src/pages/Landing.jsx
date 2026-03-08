import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-app flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-10" style={{ background: '#00e676' }} />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-10" style={{ background: '#2dd4bf' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16 z-10"
      >
        <div className="flex items-center gap-3 justify-center mb-4">
          <span className="text-5xl">🌿</span>
          <h1 className="font-display text-5xl font-bold text-primary">MessMaster</h1>
        </div>
        <p className="text-muted text-lg mt-2">Hostel Mess Intelligence Platform</p>
        <p className="text-muted text-sm mt-1">Reduce waste. Save money. Feed better.</p>
      </motion.div>

      <div className="flex gap-8 z-10">
        {[
          {
            title: 'Mess Staff',
            desc: 'Dashboard, Analytics & AI Oracle',
            icon: '👨‍🍳',
            color: '#00e676',
            path: '/staff/login',
            delay: 0.2,
          },
          {
            title: 'Student',
            desc: 'Feedback Portal & Ratings',
            icon: '🎓',
            color: '#2dd4bf',
            path: '/student/login',
            delay: 0.35,
          },
        ].map((card) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: card.delay }}
            whileHover={{ y: -6, boxShadow: `0 20px 60px ${card.color}30` }}
            onClick={() => navigate(card.path)}
            className="cursor-pointer bg-card border border-border rounded-2xl p-10 w-64 text-center transition-all duration-300"
            style={{ borderColor: '#1a2a3a' }}
          >
            <div className="text-5xl mb-4">{card.icon}</div>
            <h2 className="font-display text-2xl font-bold mb-2" style={{ color: card.color }}>
              {card.title}
            </h2>
            <p className="text-muted text-sm">{card.desc}</p>
            <div className="mt-6 py-2 px-4 rounded-lg text-sm font-medium" style={{ background: `${card.color}20`, color: card.color }}>
              Enter Portal →
            </div>
          </motion.div>
        ))}
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="mt-12 text-muted text-xs z-10"
      >
        MessMaster v1.0 · Built for Hackathon 2024
      </motion.p>
    </div>
  )
}
