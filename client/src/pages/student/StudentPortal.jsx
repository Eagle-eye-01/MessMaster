import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import api from '../../api/axios'
import useAuthStore from '../../store/useAuthStore'
import Stars from '../../components/ui/Stars'
import Badge from '../../components/ui/Badge'

const MEALS = ['Breakfast', 'Lunch', 'Snacks', 'Dinner']
const mealColor = { Breakfast: 'blue', Lunch: 'green', Snacks: 'yellow', Dinner: 'purple' }

const EMOJIS = ['', '😞', '😕', '😐', '🙂', '😄']

export default function StudentPortal() {
  const { user, logout } = useAuthStore()
  const [selectedMeal, setSelectedMeal] = useState('Lunch')
  const [overallRating, setOverallRating] = useState(0)
  const [tasteRating, setTasteRating] = useState(0)
  const [portionRating, setPortionRating] = useState(0)
  const [freshnessRating, setFreshnessRating] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const { register, handleSubmit, reset } = useForm()

  const { data: pastFeedback = [] } = useQuery({
    queryKey: ['my-feedback'],
    queryFn: () => api.get('/feedback/recent').then(r => r.data.filter(f => f.studentId?._id === user?._id || true).slice(0, 3)),
  })

  const { mutate: submitFeedback, isPending } = useMutation({
    mutationFn: (data) => api.post('/feedback', {
      ...data,
      meal: selectedMeal,
      overallRating,
      tasteRating,
      portionRating,
      freshnessRating,
    }),
    onSuccess: () => {
      setSubmitted(true)
      reset()
      setTimeout(() => setSubmitted(false), 4000)
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Submission failed'),
  })

  return (
    <div className="min-h-screen bg-app">
      {/* Header */}
      <header className="bg-surface border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🌿</span>
          <div>
            <h1 className="font-display font-bold text-teal text-lg">MessMaster Student</h1>
            <p className="text-xs text-muted">{user?.name} · {user?.rollNo}</p>
          </div>
        </div>
        <button onClick={logout} className="text-xs text-muted hover:text-red transition-colors">Sign Out</button>
      </header>

      <div className="max-w-lg mx-auto p-6 space-y-6">
        {/* Today's Banner */}
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-muted uppercase tracking-wider mb-2">Today's Date</p>
          <p className="font-display text-lg text-primary">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
        </div>

        {/* Meal Selector */}
        <div className="flex gap-2">
          {MEALS.map(meal => (
            <button key={meal} onClick={() => setSelectedMeal(meal)}
              className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${selectedMeal === meal ? 'bg-teal text-app font-bold' : 'border border-border text-muted hover:text-primary'}`}>
              {meal}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="bg-teal/10 border border-teal/30 rounded-xl p-8 text-center">
              <div className="text-5xl mb-3">✅</div>
              <h3 className="font-display text-xl text-teal mb-2">Thank you!</h3>
              <p className="text-muted text-sm">Your feedback helps reduce food waste</p>
              <div className="flex justify-center mt-4">
                <Stars value={overallRating} readonly size={24} />
              </div>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <form onSubmit={handleSubmit(submitFeedback)} className="bg-card border border-border rounded-xl p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-lg text-primary">Rate {selectedMeal}</h3>
                  <Badge color={mealColor[selectedMeal]}>{selectedMeal}</Badge>
                </div>

                {/* Overall Rating */}
                <div>
                  <label className="text-xs text-muted uppercase tracking-wider block mb-3">Overall Experience</label>
                  <div className="flex items-center gap-4">
                    <Stars value={overallRating} onChange={setOverallRating} size={32} />
                    <span className="text-3xl">{EMOJIS[overallRating]}</span>
                  </div>
                </div>

                {/* Sub Ratings */}
                <div className="grid grid-cols-1 gap-4">
                  {[
                    { label: 'Taste', value: tasteRating, onChange: setTasteRating },
                    { label: 'Portion Size', value: portionRating, onChange: setPortionRating },
                    { label: 'Freshness', value: freshnessRating, onChange: setFreshnessRating },
                  ].map(r => (
                    <div key={r.label} className="flex items-center justify-between">
                      <label className="text-sm text-muted">{r.label}</label>
                      <Stars value={r.value} onChange={r.onChange} size={20} />
                    </div>
                  ))}
                </div>

                {/* Comment */}
                <div>
                  <label className="text-xs text-muted uppercase tracking-wider block mb-1">Comments (optional)</label>
                  <textarea {...register('comment')} rows={3} maxLength={500} placeholder="Share your thoughts..."
                    className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-primary resize-none focus:outline-none focus:border-teal" />
                </div>

                <button type="submit" disabled={!overallRating || isPending}
                  className="w-full py-3 rounded-lg font-bold transition-all text-app"
                  style={{ background: !overallRating || isPending ? '#1a2a3a' : '#2dd4bf', color: !overallRating ? '#4a5f7a' : '#06080e' }}>
                  {isPending ? 'Submitting...' : overallRating ? 'Submit Feedback ✓' : 'Select a rating to continue'}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Past Feedback */}
        {pastFeedback.length > 0 && (
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="font-semibold text-primary mb-3 text-sm">Your Past Ratings</h3>
            <div className="space-y-3">
              {pastFeedback.slice(0, 3).map(fb => (
                <div key={fb._id} className="flex items-center justify-between">
                  <div>
                    <Badge color={mealColor[fb.meal] || 'blue'}>{fb.meal}</Badge>
                    <p className="text-xs text-muted mt-1">{format(new Date(fb.createdAt), 'MMM d')}</p>
                  </div>
                  <Stars value={fb.overallRating} readonly size={14} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
