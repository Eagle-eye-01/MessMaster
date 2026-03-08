import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import api from '../../api/axios'
import Badge from '../../components/ui/Badge'

const gradeColor = { 'A+': 'green', A: 'teal', 'B+': 'blue', B: 'yellow', C: 'orange' }

export default function CookReviews() {
  const today = format(new Date(), 'yyyy-MM-dd')
  const [date, setDate] = useState(today)
  const [expanded, setExpanded] = useState(null)

  const { data: reviews = [], isLoading, refetch } = useQuery({
    queryKey: ['cook-reviews', date],
    queryFn: () => api.get(`/cook-reviews/${date}`).then(r => r.data),
    enabled: !!date,
  })

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-primary">Cook Reviews</h1>
          <p className="text-muted text-sm">AI-generated performance analysis</p>
        </div>
        <div className="flex items-center gap-3">
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            className="bg-surface border border-border rounded-lg px-3 py-2 text-sm text-primary focus:outline-none focus:border-green" />
          <button onClick={() => refetch()} className="px-4 py-2 rounded-lg bg-green/10 text-green text-sm border border-green/20 hover:bg-green/20">
            Generate
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="text-center py-12">
          <div className="text-purple animate-pulse text-sm">Generating AI reviews...</div>
        </div>
      )}

      <div className="space-y-4">
        {reviews.map((review) => {
          const staff = review.staffId
          const isOpen = expanded === review._id
          return (
            <motion.div key={review._id} className="bg-card border border-border rounded-xl overflow-hidden">
              <button
                onClick={() => setExpanded(isOpen ? null : review._id)}
                className="w-full flex items-center justify-between p-5 text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-green/10 flex items-center justify-center text-green font-bold">
                    {staff?.name?.charAt(0) || '?'}
                  </div>
                  <div>
                    <p className="font-semibold text-primary">{staff?.name || 'Staff Member'}</p>
                    <p className="text-xs text-muted">{staff?.role || 'Cook'} · {staff?.speciality}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs text-muted">Score</p>
                    <p className="font-display text-lg text-green">{review.compositeScore}/10</p>
                  </div>
                  <Badge color={gradeColor[review.grade] || 'green'} className="text-lg px-3 py-1">
                    {review.grade}
                  </Badge>
                  <span className="text-muted">{isOpen ? '▲' : '▼'}</span>
                </div>
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 space-y-4 border-t border-border pt-4">
                      {/* Score Bar */}
                      <div>
                        <div className="flex justify-between text-xs text-muted mb-1">
                          <span>Composite Score</span>
                          <span>{review.compositeScore}/10</span>
                        </div>
                        <div className="w-full bg-surface rounded-full h-2">
                          <motion.div className="h-2 rounded-full bg-green"
                            initial={{ width: 0 }}
                            animate={{ width: `${(review.compositeScore / 10) * 100}%` }}
                            transition={{ duration: 0.8 }} />
                        </div>
                      </div>

                      {/* Metrics */}
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { label: 'Avg Rating', value: `${review.avgRating?.toFixed(1)}/5`, color: '#fbbf24' },
                          { label: 'Waste Ratio', value: `${(review.wasteRatio * 100)?.toFixed(0)}%`, color: '#ff6b2b' },
                          { label: 'On-Time', value: `${(review.onTimeScore * 100)?.toFixed(0)}%`, color: '#00e676' },
                        ].map(m => (
                          <div key={m.label} className="bg-surface rounded-lg p-3 text-center">
                            <p className="text-xs text-muted">{m.label}</p>
                            <p className="font-display text-lg" style={{ color: m.color }}>{m.value}</p>
                          </div>
                        ))}
                      </div>

                      {/* AI Review */}
                      {review.aiReviewText && (
                        <div className="bg-surface rounded-lg p-4 border border-purple/20">
                          <p className="text-xs text-purple uppercase tracking-wider mb-2">🤖 AI Performance Review</p>
                          <p className="text-sm text-primary italic">{review.aiReviewText}</p>
                        </div>
                      )}

                      {/* Dishes */}
                      {review.dishes?.length > 0 && (
                        <div>
                          <p className="text-xs text-muted uppercase tracking-wider mb-2">Dish Breakdown</p>
                          <div className="space-y-2">
                            {review.dishes.map((dish, i) => (
                              <div key={i} className="flex items-center justify-between text-xs py-2 border-b border-border">
                                <span className="text-primary">{dish.menuItemName}</span>
                                <div className="flex gap-4 text-muted">
                                  <span>Prepared: {dish.preparedKg?.toFixed(1)}kg</span>
                                  <span className="text-orange">Wasted: {dish.wastedKg?.toFixed(1)}kg</span>
                                  <span>{dish.onTime ? '✅' : '⏰'}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>

      {reviews.length === 0 && !isLoading && (
        <div className="text-center py-12 text-muted">
          <p>Select a date and click Generate to create AI reviews</p>
        </div>
      )}
    </motion.div>
  )
}
