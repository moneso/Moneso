'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

export default function AuthPage() {
  const router = useRouter()
  const supabase = createClient()
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // We use a fake email derived from username for Supabase auth
  const fakeEmail = (u) => `${u.toLowerCase()}@mone.so`

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (mode === 'register') {
        // Check username not taken
        const { data: existing } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', username)
          .single()

        if (existing) {
          setError('Username already taken.')
          setLoading(false)
          return
        }

        const { error: signUpError } = await supabase.auth.signUp({
          email: fakeEmail(username),
          password,
          options: { data: { username } },
        })
        if (signUpError) throw signUpError
        router.push('/marketplace')
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: fakeEmail(username),
          password,
        })
        if (signInError) throw signInError
        router.push('/marketplace')
      }
    } catch (err) {
      setError(err.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4">
      {/* Logo */}
      <Link href="/" className="text-white font-bold text-xl tracking-widest mb-10 hover:text-[#FF6600] transition-colors">
        MONE.SO
      </Link>

      <div className="w-full max-w-sm">
        {/* Tabs */}
        <div className="flex mb-6 border border-zinc-800 rounded-lg overflow-hidden">
          <button
            onClick={() => setMode('login')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              mode === 'login' ? 'bg-[#FF6600] text-black' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setMode('register')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              mode === 'register' ? 'bg-[#FF6600] text-black' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-zinc-500 mb-1 uppercase tracking-wider">Username</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value.replace(/\s/g, ''))}
              required
              minLength={3}
              maxLength={20}
              placeholder="satoshi"
              className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#FF6600] placeholder-zinc-600"
            />
          </div>

          <div>
            <label className="block text-xs text-zinc-500 mb-1 uppercase tracking-wider">Password</label>
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

          {error && (
            <p className="text-red-400 text-xs bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#FF6600] hover:bg-[#e55a00] text-black font-bold py-3 rounded-lg text-sm transition-colors disabled:opacity-50"
          >
            {loading ? '...' : mode === 'login' ? 'Login' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-zinc-600 text-xs mt-6">
          No email required. No KYC. Privacy first.
        </p>
      </div>
    </div>
  )
}
