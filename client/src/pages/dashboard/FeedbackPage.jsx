import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { QRCodeSVG } from 'qrcode.react'
import { format } from 'date-fns'
import api from '../../api/axios'
import Stars from '../../components/ui/Stars'
import Badge from '../../components/ui/Badge'

const mealColor = { Breakfast: 'blue', Lunch: 'green', Snacks: 'yellow', Dinner: 'purple' }

export default function FeedbackPage() {
  const feedbackUrl = import.meta.env.VITE_STUDENT_FEEDBACK_URL || 'http://localhost:5173/student'

  const { data: recent = [] } = useQuery({
    queryKey: ['recent-feedback'],
    queryFn: () => api.get('/feedback/recent').then(r => r.data),
    refetchInterval: 30000,
  })

  const { data: summary = [] } = useQuery({
    queryKey: ['feedback-summary'],
    queryFn: () => api.get('/feedback/summary').then(r => r.data),
  })

  const avgRating = recent.length > 0
    ? (recent.reduce((s, f) => s + f.overallRating, 0) / recent.length).toFixed(1)
    : '—'

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-primary">Student Feedback</h1>
        <p className="text-muted text-sm">Live response feed from students</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* QR Panel */}
        <div className="bg-card border border-border rounded-xl p-6 text-center">
          <h3 className="font-semibold text-teal mb-4">Scan to Rate Food</h3>
          <div className="inline-block p-4 bg-white rounded-xl mb-4">
            <QRCodeSVG value={feedbackUrl} size={160} />
          </div>
          <p className="text-xs text-muted mb-4 break-all">{feedbackUrl}</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-surface rounded-lg p-3">
              <p className="text-xs text-muted">Responses</p>
              <p className="font-display text-xl text-teal">{recent.length}</p>
            </div>
            <div className="bg-surface rounded-lg p-3">
              <p className="text-xs text-muted">Avg Rating</p>
              <p className="font-display text-xl text-yellow">{avgRating}</p>
            </div>
          </div>
          <button onClick={() => window.print()} className="mt-4 w-full py-2 rounded-lg border border-border text-muted text-sm hover:text-primary transition-colors">
            🖨️ Print QR Card
          </button>
        </div>

        {/* Rating Summary */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-semibold text-primary mb-4">Rating by Meal</h3>
          <div className="space-y-4">
            {summary.length === 0 && <p className="text-muted text-sm">No data yet</p>}
            {summary.map(s => (
              <div key={s._id} className="flex items-center justify-between">
                <div>
                  <Badge color={mealColor[s._id] || 'blue'}>{s._id}</Badge>
                  <p className="text-xs text-muted mt-1">{s.count} responses</p>
                </div>
                <div className="text-right">
                  <Stars value={Math.round(s.avgOverall || 0)} readonly size={14} />
                  <p className="text-xs text-yellow mt-0.5">{s.avgOverall?.toFixed(1)}/5.0</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Feed */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 bg-green rounded-full animate-pulse" />
            <h3 className="font-semibold text-primary">Live Feed</h3>
          </div>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {recent.length === 0 && <p className="text-muted text-sm">No feedback yet</p>}
            {recent.map((fb) => (
              <div key={fb._id} className="pb-3 border-b border-border">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-primary">{fb.studentId?.name || 'Student'}</span>
                    <Badge color={mealColor[fb.meal] || 'blue'} className="text-xs">{fb.meal}</Badge>
                  </div>
                  <Stars value={fb.overallRating} readonly size={12} />
                </div>
                {fb.comment && <p className="text-xs text-muted italic">"{fb.comment}"</p>}
                <p className="text-xs text-muted mt-1">{format(new Date(fb.createdAt), 'MMM d, h:mm a')}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
