import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import api from '../../api/axios'
import KPICard from '../../components/ui/KPICard'
import Badge from '../../components/ui/Badge'

const CATEGORIES = ['All', 'Grains', 'Legumes', 'Vegetables', 'Dairy', 'Spices', 'Oils', 'Utensils', 'Energy', 'Other']

export default function InventoryPage() {
  const qc = useQueryClient()
  const [cat, setCat] = useState('All')
  const [showAdd, setShowAdd] = useState(false)
  const { register, handleSubmit, reset } = useForm()
  const { register: regEnergy, handleSubmit: handleEnergy, reset: resetEnergy } = useForm()

  const { data: items = [] } = useQuery({
    queryKey: ['inventory', cat],
    queryFn: () => api.get(`/inventory${cat !== 'All' ? `?category=${cat}` : ''}`).then(r => r.data),
  })

  const { data: lowStock = [] } = useQuery({
    queryKey: ['low-stock'],
    queryFn: () => api.get('/inventory/low-stock').then(r => r.data),
  })

  const { data: energySummary } = useQuery({
    queryKey: ['energy-summary'],
    queryFn: () => api.get('/inventory/energy-summary').then(r => r.data),
  })

  const { mutate: addItem, isPending: adding } = useMutation({
    mutationFn: (data) => api.post('/inventory', { ...data, qty: +data.qty, minQty: +data.minQty, costPerUnit: +data.costPerUnit }),
    onSuccess: () => { toast.success('Item added'); reset(); setShowAdd(false); qc.invalidateQueries({ queryKey: ['inventory'] }) },
    onError: (e) => toast.error(e.response?.data?.error || 'Failed'),
  })

  const { mutate: updateQty } = useMutation({
    mutationFn: ({ id, delta, current }) => api.put(`/inventory/${id}`, { qty: Math.max(0, current + delta) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['inventory'] }),
  })

  const { mutate: logEnergy, isPending: loggingEnergy } = useMutation({
    mutationFn: (data) => api.post('/inventory/energy-log', { gasKg: +data.gasKg, electricityKwh: +data.electricityKwh }),
    onSuccess: () => { toast.success('Energy logged'); resetEnergy(); qc.invalidateQueries({ queryKey: ['energy-summary'] }) },
    onError: (e) => toast.error(e.response?.data?.error || 'Failed'),
  })

  const totalValue = items.reduce((s, i) => s + (i.qty * i.costPerUnit), 0)

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-primary">Inventory</h1>
          <p className="text-muted text-sm">Stock management and energy tracking</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className="px-4 py-2 rounded-lg bg-green text-app text-sm font-semibold">
          + Add Item
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Total Value" value={totalValue} prefix="₹" color="#00e676" icon="💰" />
        <KPICard label="Low Stock" value={lowStock.length} color="#ff3d5a" icon="⚠️" />
        <KPICard label="Gas Today" value={energySummary?.today?.gasKg || 0} suffix=" kg" color="#ff6b2b" icon="⛽" />
        <KPICard label="Power Today" value={energySummary?.today?.electricityKwh || 0} suffix=" kWh" color="#a78bfa" icon="⚡" />
      </div>

      {/* Low Stock Alert */}
      {lowStock.length > 0 && (
        <div className="bg-red/10 border border-red/30 rounded-xl p-4 flex items-start gap-3">
          <span className="text-red text-xl">⚠️</span>
          <div>
            <p className="text-red font-semibold text-sm">Low Stock Alert</p>
            <p className="text-xs text-primary mt-1">
              {lowStock.map(i => `${i.name} (${i.qty}${i.unit})`).join(', ')}
            </p>
          </div>
        </div>
      )}

      {/* Add Item Form */}
      {showAdd && (
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-semibold text-primary mb-4">Add Inventory Item</h3>
          <form onSubmit={handleSubmit(addItem)} className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <input {...register('name', { required: true })} placeholder="Item Name" className="bg-surface border border-border rounded px-3 py-2 text-sm text-primary focus:outline-none focus:border-green col-span-2" />
            <select {...register('category', { required: true })} className="bg-surface border border-border rounded px-3 py-2 text-sm text-primary focus:outline-none focus:border-green">
              {CATEGORIES.slice(1).map(c => <option key={c}>{c}</option>)}
            </select>
            <input {...register('unit', { required: true })} placeholder="Unit (kg/pcs/L)" className="bg-surface border border-border rounded px-3 py-2 text-sm text-primary focus:outline-none focus:border-green" />
            <input {...register('qty', { required: true })} type="number" placeholder="Qty" className="bg-surface border border-border rounded px-3 py-2 text-sm text-primary focus:outline-none focus:border-green" />
            <input {...register('minQty', { required: true })} type="number" placeholder="Min Qty" className="bg-surface border border-border rounded px-3 py-2 text-sm text-primary focus:outline-none focus:border-green" />
            <input {...register('costPerUnit')} type="number" placeholder="Cost/Unit (₹)" className="bg-surface border border-border rounded px-3 py-2 text-sm text-primary focus:outline-none focus:border-green" />
            <input {...register('icon')} placeholder="Icon (emoji)" className="bg-surface border border-border rounded px-3 py-2 text-sm text-primary focus:outline-none focus:border-green" />
            <button type="submit" disabled={adding} className="bg-green text-app rounded px-4 py-2 text-sm font-semibold col-span-4">
              {adding ? 'Adding...' : 'Add Item'}
            </button>
          </form>
        </div>
      )}

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setCat(c)}
            className={`px-3 py-1 rounded-full text-xs transition-all ${cat === c ? 'bg-green text-app font-semibold' : 'border border-border text-muted hover:text-primary'}`}>
            {c}
          </button>
        ))}
      </div>

      {/* Inventory Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              {['Item', 'Category', 'Stock', 'Min', 'Cost/Unit', 'Total Value', 'Adjust'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs text-muted uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item._id} className={`border-b border-border hover:bg-surface/50 transition-colors ${item.qty <= item.minQty ? 'bg-red/5' : ''}`}>
                <td className="px-4 py-3">
                  <span className="mr-2">{item.icon}</span>
                  <span className="text-primary">{item.name}</span>
                </td>
                <td className="px-4 py-3">
                  <Badge color="blue">{item.category}</Badge>
                </td>
                <td className={`px-4 py-3 font-semibold ${item.qty <= item.minQty ? 'text-red' : 'text-primary'}`}>
                  {item.qty} {item.unit}
                </td>
                <td className="px-4 py-3 text-muted">{item.minQty} {item.unit}</td>
                <td className="px-4 py-3 text-muted">₹{item.costPerUnit}</td>
                <td className="px-4 py-3 text-green">₹{(item.qty * item.costPerUnit).toLocaleString()}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button onClick={() => updateQty({ id: item._id, delta: -1, current: item.qty })} className="w-6 h-6 rounded bg-surface border border-border text-muted hover:text-red flex items-center justify-center text-sm">−</button>
                    <button onClick={() => updateQty({ id: item._id, delta: 1, current: item.qty })} className="w-6 h-6 rounded bg-surface border border-border text-muted hover:text-green flex items-center justify-center text-sm">+</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && (
          <p className="text-center text-muted text-sm py-8">No items in this category</p>
        )}
      </div>

      {/* Energy Logger */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="font-semibold text-primary mb-4">⚡ Log Energy Usage</h3>
        <form onSubmit={handleEnergy(logEnergy)} className="flex gap-4 items-end">
          <div>
            <label className="text-xs text-muted block mb-1">LPG Gas (kg)</label>
            <input {...regEnergy('gasKg', { required: true })} type="number" step="0.1" placeholder="10.5" className="bg-surface border border-border rounded px-3 py-2 text-sm text-primary focus:outline-none focus:border-orange" />
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">Electricity (kWh)</label>
            <input {...regEnergy('electricityKwh', { required: true })} type="number" step="1" placeholder="150" className="bg-surface border border-border rounded px-3 py-2 text-sm text-primary focus:outline-none focus:border-purple" />
          </div>
          <button type="submit" disabled={loggingEnergy} className="px-4 py-2 rounded-lg bg-orange/20 text-orange border border-orange/30 text-sm hover:bg-orange/30">
            {loggingEnergy ? 'Logging...' : 'Log Energy'}
          </button>
        </form>
        {energySummary?.mtd && (
          <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
            <div className="bg-surface rounded p-3">
              <p className="text-muted">MTD Gas</p>
              <p className="text-orange font-semibold">{energySummary.mtd.gasKg?.toFixed(1)} kg = ₹{energySummary.mtd.gasCost?.toFixed(0)}</p>
            </div>
            <div className="bg-surface rounded p-3">
              <p className="text-muted">MTD Electricity</p>
              <p className="text-purple font-semibold">{energySummary.mtd.electricityKwh?.toFixed(0)} kWh = ₹{energySummary.mtd.electricityCost?.toFixed(0)}</p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
