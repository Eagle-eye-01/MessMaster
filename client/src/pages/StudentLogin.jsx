import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Eye, EyeOff } from 'lucide-react'
import useAuthStore from '../store/useAuthStore'

export default function StudentLogin() {
  const { login } = useAuthStore()
  const navigate = useNavigate()
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, setValue, formState: { errors } } = useForm()

  const onSubmit = async ({ email, password }) => {
    setLoading(true)
    try {
      await login(email, password)
      navigate('/student')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-app flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-2xl p-10 w-full max-w-md"
      >
        <Link to="/" className="text-muted text-sm mb-6 block hover:text-primary">← Back</Link>

        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">🎓</span>
          <h1 className="font-display text-2xl font-bold text-teal">Student Login</h1>
        </div>
        <p className="text-muted text-sm mb-8">Rate your mess food and help reduce waste</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-xs text-muted uppercase tracking-wider block mb-1">Email</label>
            <input
              {...register('email', { required: 'Email required' })}
              type="email"
              className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-primary focus:outline-none focus:border-teal transition-colors"
              placeholder="arjun@student.edu"
            />
            {errors.email && <p className="text-red text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div className="relative">
            <label className="text-xs text-muted uppercase tracking-wider block mb-1">Password</label>
            <input
              {...register('password', { required: 'Password required' })}
              type={showPass ? 'text' : 'password'}
              className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-primary focus:outline-none focus:border-teal transition-colors pr-12"
              placeholder="••••••••"
            />
            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-9 text-muted hover:text-primary">
              {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg font-semibold transition-all duration-200 text-app"
            style={{ background: loading ? '#4a5f7a' : '#2dd4bf' }}
          >
            {loading ? 'Signing in...' : 'Sign In →'}
          </button>
        </form>

        <div className="mt-6 p-4 bg-surface rounded-lg border border-border">
          <p className="text-xs text-muted mb-2 font-semibold uppercase">Demo Accounts</p>
          {[
            { label: 'Arjun Mehta (CS21B001)', email: 'arjun@student.edu', pass: 'stu123' },
            { label: 'Sneha Patel (EE21B042)', email: 'sneha@student.edu', pass: 'stu456' },
          ].map(d => (
            <button key={d.email} onClick={() => { setValue('email', d.email); setValue('password', d.pass) }}
              className="w-full text-left text-xs p-2 rounded hover:bg-card transition-colors">
              <span className="text-teal">{d.label}</span>
              <span className="text-muted ml-2">{d.email}</span>
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
