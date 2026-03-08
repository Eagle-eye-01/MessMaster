import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import api from '../../api/axios'

export default function LogWaste() {
  const qc = useQueryClient()
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  const { data: menuItems = [] } = useQuery({
    queryKey: ['menu-items'],
    queryFn: () => api.get('/menu-items').then(r => r.data),
  })

  const { data: recentLogs = [] } = useQuery({
    queryKey: ['waste-logs'],
    queryFn: () => api.get('/waste-logs?limit=20').then(r => r.data),
  })

  const { mutate: logWaste, isPending } = useMutation({
    mutationFn: (data) => api.post('/waste-logs', {
      ...data,
      preparedKg: parseFloat(data.preparedKg),
      wastedKg: parseFloat(data.wastedKg),
      date: new Date(),
    }),
    onSuccess: () => {
      toast.success('Waste log recorded')
      reset()
      qc.invalidateQueries({ queryKey: ['waste-logs'] })
      qc.invalidateQueries({ queryKey: ['overview'] })
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to log waste'),
  })

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-4xl">
      <div>
        <h1 className="font-display text-2xl font-bold text-primary">Log Waste</h1>
        <p className="text-muted text-sm">Record daily food wastage entries</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-semibold text-primary mb-4">New Entry</h3>
          <form onSubmit={handleSubmit(logWaste)} className="space-y-4">
            <div>
              <label className="text-xs text-muted uppercase tracking-wider block mb-1">Meal</label>
              <select {...register('meal', { required: true })} className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-primary focus:outline-none focus:border-green">
                {['Breakfast', 'Lunch', 'Snacks', 'Dinner'].map(m => <option key={m}>{m}</option>)}
              </select>
            </div>

            <div>
              <label className="text-xs text-muted uppercase tracking-wider block mb-1">Menu Item</label>
              <select {...register('menuItemName', { required: true })} className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-primary focus:outline-none focus:border-green">
                <option value="">Select item...</option>
                {menuItems.map(item => <option key={item._id} value={item.name}>{item.name}</option>)}
              </select>
              {errors.menuItemName && <p className="text-red text-xs mt-1">Required</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted uppercase tracking-wider block mb-1">Prepared (kg)</label>
                <input {...register('preparedKg', { required: true, min: 0.1 })} type="number" step="0.1" placeholder="50.0"
                  className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-primary focus:outline-none focus:border-green" />
                {errors.preparedKg && <p className="text-red text-xs mt-1">Required</p>}
              </div>
              <div>
                <label className="text-xs text-muted uppercase tracking-wider block mb-1">Wasted (kg)</label>
                <input {...register('wastedKg', { required: true, min: 0 })} type="number" step="0.1" placeholder="5.0"
                  className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-primary focus:outline-none focus:border-green" />
                {errors.wastedKg && <p className="text-red text-xs mt-1">Required</p>}
              </div>
            </div>

            <button type="submit" disabled={isPending}
              className="w-full py-3 rounded-lg font-semibold text-app transition-all"
              style={{ background: isPending ? '#4a5f7a' : '#00e676' }}>
              {isPending ? 'Saving...' : '+ Log Waste Entry'}
            </button>
          </form>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-semibold text-primary mb-4">Recent Entries</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {recentLogs.length === 0 && <p className="text-muted text-sm">No entries yet</p>}
            {recentLogs.map((log) => (
              <div key={log._id} className="flex items-center justify-between py-3 border-b border-border">
                <div>
                  <p className="text-sm text-primary font-medium">{log.menuItemName}</p>
                  <p className="text-xs text-muted">{log.meal} · {format(new Date(log.date), 'MMM d, yyyy')}</p>
                </div>
                <div className="text-right">
                  <p className="text-orange font-semibold text-sm">{log.wastedKg} kg</p>
                  <p className="text-xs text-muted">₹{log.costLoss}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
