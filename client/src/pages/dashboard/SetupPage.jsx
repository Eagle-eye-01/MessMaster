import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import useAuthStore from '../../store/useAuthStore'

export default function SetupPage() {
  const { user } = useAuthStore()
  const qc = useQueryClient()
  const navigate = useNavigate()
  const [tab, setTab] = useState('mess')
  const { register, handleSubmit } = useForm()

  const { data: mess } = useQuery({
    queryKey: ['mess', user?.messId],
    queryFn: () => api.get(`/mess/${user.messId}`).then(r => r.data),
    enabled: !!user?.messId,
  })

  const { data: menuItems = [] } = useQuery({
    queryKey: ['menu-items'],
    queryFn: () => api.get('/menu-items').then(r => r.data),
  })

  const { data: staffList = [] } = useQuery({
    queryKey: ['staff'],
    queryFn: () => api.get('/staff').then(r => r.data),
  })

  const { mutate: updateMess } = useMutation({
    mutationFn: (data) => api.put(`/mess/${user.messId}`, data),
    onSuccess: () => { toast.success('Mess info updated'); qc.invalidateQueries({ queryKey: ['mess'] }) },
  })

  const { mutate: addMenuItem } = useMutation({
    mutationFn: (data) => api.post('/menu-items', data),
    onSuccess: () => { toast.success('Menu item added'); qc.invalidateQueries({ queryKey: ['menu-items'] }) },
  })

  const { mutate: deleteMenuItem } = useMutation({
    mutationFn: (id) => api.delete(`/menu-items/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['menu-items'] }),
  })

  const { mutate: addStaff } = useMutation({
    mutationFn: (data) => api.post('/staff', data),
    onSuccess: () => { toast.success('Staff added'); qc.invalidateQueries({ queryKey: ['staff'] }) },
  })

  const { mutate: deleteStaff } = useMutation({
    mutationFn: (id) => api.delete(`/staff/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['staff'] }),
  })

  const TABS = [
    { id: 'mess', label: 'Mess Info' },
    { id: 'menu', label: 'Menu Items' },
    { id: 'staff', label: 'Staff Members' },
  ]

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-primary">Setup</h1>
          <p className="text-muted text-sm">Manage mess configuration</p>
        </div>
        <button onClick={() => navigate('/setup')} className="px-4 py-2 rounded-lg border border-border text-muted text-sm hover:text-primary">
          Re-run Setup Wizard
        </button>
      </div>

      <div className="flex gap-2">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-lg text-sm transition-all ${tab === t.id ? 'bg-green text-app font-semibold' : 'border border-border text-muted hover:text-primary'}`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        {tab === 'mess' && mess && (
          <form onSubmit={handleSubmit(updateMess)} className="space-y-4">
            <h3 className="font-semibold text-primary mb-4">Mess Information</h3>
            {[
              { name: 'name', label: 'Mess Name', defaultValue: mess.name },
              { name: 'capacity', label: 'Capacity', defaultValue: mess.capacity, type: 'number' },
              { name: 'phone', label: 'Phone', defaultValue: mess.phone },
              { name: 'address', label: 'Address', defaultValue: mess.address },
            ].map(f => (
              <div key={f.name}>
                <label className="text-xs text-muted uppercase tracking-wider block mb-1">{f.label}</label>
                <input {...register(f.name)} defaultValue={f.defaultValue} type={f.type || 'text'}
                  className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-primary focus:outline-none focus:border-green" />
              </div>
            ))}
            <button type="submit" className="w-full py-2 rounded-lg bg-green text-app font-semibold text-sm">Save Changes</button>
          </form>
        )}

        {tab === 'menu' && (
          <div>
            <h3 className="font-semibold text-primary mb-4">Menu Items ({menuItems.length})</h3>
            <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
              {menuItems.map(item => (
                <div key={item._id} className="flex items-center justify-between py-2 border-b border-border">
                  <div>
                    <span className="text-primary text-sm">{item.name}</span>
                    <span className="text-muted text-xs ml-2">{item.category}</span>
                  </div>
                  <button onClick={() => deleteMenuItem(item._id)} className="text-red text-xs hover:underline">Remove</button>
                </div>
              ))}
            </div>
            <AddMenuForm onAdd={addMenuItem} />
          </div>
        )}

        {tab === 'staff' && (
          <div>
            <h3 className="font-semibold text-primary mb-4">Staff Members ({staffList.length})</h3>
            <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
              {staffList.map(s => (
                <div key={s._id} className="flex items-center justify-between py-2 border-b border-border">
                  <div>
                    <span className="text-primary text-sm">{s.name}</span>
                    <span className="text-muted text-xs ml-2">{s.role}</span>
                  </div>
                  <button onClick={() => deleteStaff(s._id)} className="text-red text-xs hover:underline">Remove</button>
                </div>
              ))}
            </div>
            <AddStaffForm onAdd={addStaff} />
          </div>
        )}
      </div>
    </motion.div>
  )
}

function AddMenuForm({ onAdd }) {
  const { register, handleSubmit, reset } = useForm()
  return (
    <form onSubmit={handleSubmit(data => { onAdd(data); reset() })} className="flex gap-2">
      <input {...register('name', { required: true })} placeholder="Dish name" className="flex-1 bg-surface border border-border rounded px-3 py-2 text-sm text-primary focus:outline-none focus:border-green" />
      <select {...register('category')} className="bg-surface border border-border rounded px-2 py-2 text-sm text-primary focus:outline-none focus:border-green">
        {['Breakfast', 'Main Course', 'Side Dish', 'Snacks', 'Dessert', 'Beverages'].map(c => <option key={c}>{c}</option>)}
      </select>
      <button type="submit" className="px-3 py-2 bg-green text-app rounded text-sm font-semibold">Add</button>
    </form>
  )
}

function AddStaffForm({ onAdd }) {
  const { register, handleSubmit, reset } = useForm()
  return (
    <form onSubmit={handleSubmit(data => { onAdd(data); reset() })} className="flex gap-2">
      <input {...register('name', { required: true })} placeholder="Staff name" className="flex-1 bg-surface border border-border rounded px-3 py-2 text-sm text-primary focus:outline-none focus:border-green" />
      <select {...register('role')} className="bg-surface border border-border rounded px-2 py-2 text-sm text-primary focus:outline-none focus:border-green">
        {['Head Cook', 'Cook', 'Assistant Cook', 'Helper', 'Store Keeper', 'Manager'].map(r => <option key={r}>{r}</option>)}
      </select>
      <button type="submit" className="px-3 py-2 bg-green text-app rounded text-sm font-semibold">Add</button>
    </form>
  )
}
