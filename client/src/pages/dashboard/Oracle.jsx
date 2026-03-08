import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import api from '../../api/axios'
import Badge from '../../components/ui/Badge'

const SCAN_STEPS = [
  'Initializing neural network...',
  'Loading historical waste patterns...',
  'Applying day-of-week multiplier...',
  'Analyzing weather impact...',
  'Processing campus event modifier...',
  'Computing confidence score...',
  'Generating action recommendations...',
  'Prediction complete.',
]

const riskColor = { CRITICAL: 'red', HIGH: 'orange', MODERATE: 'yellow', LOW: 'green' }

export default function Oracle() {
  const { register, handleSubmit } = useForm()
  const [scanning, setScanning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [stepMsg, setStepMsg] = useState('')
  const [result, setResult] = useState(null)

  const runPrediction = async (data) => {
    setResult(null)
    setScanning(true)
    setProgress(0)

    // Animate scan bar
    let step = 0
    const interval = setInterval(() => {
      step++
      setProgress(Math.min((step / SCAN_STEPS.length) * 100, 100))
      setStepMsg(SCAN_STEPS[Math.min(step - 1, SCAN_STEPS.length - 1)])
      if (step >= SCAN_STEPS.length) clearInterval(interval)
    }, 250)

    try {
      await new Promise(r => setTimeout(r, 2200))
      const res = await api.post('/oracle/predict', data)
      setResult(res.data)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Prediction failed')
    } finally {
      setScanning(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-4xl">
      <div>
        <h1 className="font-display text-2xl font-bold text-purple">Predictive Waste Oracle</h1>
        <p className="text-muted text-sm">AI-powered pre-meal waste forecasting</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-semibold text-primary mb-4">Configure Prediction</h3>
          <form onSubmit={handleSubmit(runPrediction)} className="space-y-4">
            {[
              {
                label: 'Primary Menu Item', name: 'menu',
                options: ['Chole Bhature', 'Dal Makhani', 'Kadhi Chawal', 'Rajma Rice', 'Veg Biryani', 'Paneer Butter Masala', 'Aloo Paratha', 'Pav Bhaji', 'Idli Sambar', 'Poha'],
              },
              {
                label: 'Meal Service', name: 'meal',
                options: ['Breakfast', 'Lunch', 'Snacks', 'Dinner'],
              },
              {
                label: 'Day of Week', name: 'day',
                options: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
              },
              {
                label: 'Weather Condition', name: 'weather',
                options: ['Sunny', 'Cloudy', 'Rainy', 'Stormy', 'Very Hot'],
              },
              {
                label: 'Campus Event', name: 'event',
                options: ['None', 'Exam Week', 'Holiday', 'Sports Day', 'Cultural Fest', 'Long Weekend'],
              },
            ].map(field => (
              <div key={field.name}>
                <label className="text-xs text-muted uppercase tracking-wider block mb-1">{field.label}</label>
                <select {...register(field.name, { required: true })}
                  className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-primary focus:outline-none focus:border-purple">
                  {field.options.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            ))}

            <button type="submit" disabled={scanning}
              className="w-full py-3 rounded-lg font-bold transition-all text-app mt-2"
              style={{ background: scanning ? '#4a5f7a' : '#a78bfa' }}>
              {scanning ? '⚡ Analyzing...' : '⚡ Execute Prediction Model'}
            </button>
          </form>
        </div>

        {/* Result Panel */}
        <div className="bg-card border border-border rounded-xl p-6">
          <AnimatePresence mode="wait">
            {scanning && (
              <motion.div key="scanning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <h3 className="font-semibold text-purple mb-6 flex items-center gap-2">
                  <span className="animate-pulse">●</span> Oracle Engine Active
                </h3>
                <div className="bg-surface rounded-lg p-4 mb-4 font-mono text-xs text-purple min-h-24">
                  {SCAN_STEPS.slice(0, Math.ceil((progress / 100) * SCAN_STEPS.length)).map((step, i) => (
                    <div key={i} className="mb-1">{'>'} {step}</div>
                  ))}
                  <span className="animate-pulse">█</span>
                </div>
                <div className="w-full bg-border rounded-full h-2">
                  <motion.div className="h-2 rounded-full" style={{ background: '#a78bfa' }}
                    animate={{ width: `${progress}%` }} transition={{ duration: 0.2 }} />
                </div>
                <p className="text-xs text-muted mt-2 text-right">{Math.round(progress)}%</p>
              </motion.div>
            )}

            {!scanning && !result && (
              <motion.div key="idle" className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="text-6xl mb-4 opacity-30">🔮</div>
                <p className="text-muted text-sm">Configure parameters and run the prediction model</p>
              </motion.div>
            )}

            {!scanning && result && (
              <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="text-center mb-6">
                  <Badge color={riskColor[result.riskLevel] || 'green'} className="text-sm mb-2">{result.riskLevel} RISK</Badge>
                  <div className="font-display text-5xl font-bold mt-2" style={{ color: result.riskColor }}>
                    {result.predictedKg} <span className="text-2xl">kg</span>
                  </div>
                  <p className="text-muted text-sm mt-1">Predicted Wastage</p>
                  <p className="text-xs text-muted">Confidence: {result.confidence}%</p>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-surface rounded-lg p-3 text-center">
                    <p className="text-xs text-muted">Cost Loss</p>
                    <p className="font-display text-lg text-red">₹{result.costLoss}</p>
                  </div>
                  <div className="bg-surface rounded-lg p-3 text-center">
                    <p className="text-xs text-muted">CO₂ Impact</p>
                    <p className="font-display text-lg text-purple">{result.co2Kg} kg</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs text-muted uppercase tracking-wider">Recommended Actions</p>
                  {result.actions?.map((action, i) => (
                    <div key={i} className="text-xs text-primary bg-surface rounded px-3 py-2 border border-border">{action}</div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Why this prediction */}
      {result && !scanning && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-semibold text-primary mb-4">Why this prediction?</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {result.reasons?.map((reason, i) => (
              <div key={i} className="bg-surface rounded-lg p-3 border border-border">
                <p className="text-xs text-primary">{reason}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
