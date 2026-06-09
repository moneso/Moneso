'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

export default function UpdatePasswordPage() {
  const router = useRouter()
  const supabase = createClient()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    setLoading(true)
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password })
      if (updateError) throw updateError
      setSuccess('Password updated. Redirecting...')
      setTimeout(() => router.push('/marketplace'), 2000)
    } catch (err) {
      setError(err.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4">
      <Link href="/" className="text-white font-bold text-xl tracking-widest mb-10 hover:text-[#FF6600] transition-colors">
        MONE.SO
      </Link>
      <div className="w-full max-w-sm">
        <h2 className="text-white font-bold text-lg mb-6">Set New Password</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-zinc-500 mb-1 uppercase tracking-wider">New Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={8}
              placeholder="••••••••"
              className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#FF6600] placeholder-zinc-600"
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1 uppercase tracking-wider">Confirm Password</label>
            <input
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              required
              minLength={8}
              placeholder="••••••••"
              className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#FF6600] placeholder-zinc-600"
            />
          </div>
          {error && (
            <p className="text-red-400 text-xs bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">{error}</p>
          )}
          {success && (
            <p className="text-green-400 text-xs bg-green-400/10 border border-green-400/20 rounded-lg px-4 py-3">{success}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#FF6600] hover:bg-[#e55a00] text-black font-bold py-3 rounded-lg text-sm transition-colors disabled:opacity-50"
          >
            {loading ? '...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  )
}
