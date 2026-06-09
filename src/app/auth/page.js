'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

export default function AuthPage() {
  const router = useRouter()
  const supabase = createClient()
  const [mode, setMode] = useState('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [resetEmail, setResetEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const fakeEmail = (u) => `${u.toLowerCase()}@mone.so`

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      if (mode === 'register') {
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

        const authEmail = email.trim() ? email.trim() : fakeEmail(username)

        const { error: signUpError } = await supabase.auth.signUp({
          email: authEmail,
          password,
          options: { data: { username, recovery_email: email.trim() || null } },
        })
        if (signUpError) throw signUpError
        router.push('/marketplace')

      } else if (mode === 'login') {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: fakeEmail(username),
          password,
        })
        if (signInError) throw signInError
        router.push('/marketplace')

      } else if (mode === 'reset') {
        if (!resetEmail.trim()) {
          setError('Please enter your email address.')
          setLoading(false)
          return
        }
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(
          resetEmail.trim(),
          { redirectTo: `${window.location.origin}/auth/update-password` }
        )
        if (resetError) throw resetError
        setSuccess('If an account with this email exists, you will receive a reset link shortly.')
      }
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
        {mode !== 'reset' && (
          <div className="flex mb-6 border border-zinc-800 rounded-lg overflow-hidden">
            <button
              onClick={() => { setMode('login'); setError(''); setSuccess('') }}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                mode === 'login' ? 'bg-[#FF6600] text-black' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => { setMode('register'); setError(''); setSuccess('') }}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                mode === 'register' ? 'bg-[#FF6600] text-black' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Register
            </button>
          </div>
        )}

        {mode === 'reset' && (
          <div className="mb-6">
            <button
              onClick={() => { setMode('login'); setError(''); setSuccess('') }}
              className="text-zinc-500 hover:text-white text-sm transition-colors"
            >
              ← Back to login
            </button>
            <h2 className="text-white font-bold text-lg mt-3">Reset Password</h2>
            <p className="text-zinc-500 text-xs mt-1">Enter the email you used when registering.</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'reset' ? (
            <div>
              <label className="block text-xs text-zinc-500 mb-1 uppercase tracking-wider">Email</label>
              <input
                type="email"
                value={resetEmail}
                onChange={e => setResetEmail(e.target.value)}
                required
                placeholder="your@email.com"
                className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#FF6600] placeholder-zinc-600"
              />
            </div>
          ) : (
            <>
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

              {mode === 'register' && (
                <div>
                  <label className="block text-xs text-zinc-500 mb-1 uppercase tracking-wider">
                    Email <span className="text-zinc-600 normal-case">(optional — for password recovery only)</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#FF6600] placeholder-zinc-600"
                  />
                </div>
              )}
            </>
          )}

          {error && (
            <p className="text-red-400 text-xs bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">
              {error}
            </p>
          )}

          {success && (
            <p className="text-green-400 text-xs bg-green-400/10 border border-green-400/20 rounded-lg px-4 py-3">
              {success}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#FF6600] hover:bg-[#e55a00] text-black font-bold py-3 rounded-lg text-sm transition-colors disabled:opacity-50"
          >
            {loading ? '...' : mode === 'login' ? 'Login' : mode === 'register' ? 'Create Account' : 'Send Reset Link'}
          </button>
        </form>

        {mode === 'login' && (
          <p className="text-center mt-4">
            <button
              onClick={() => { setMode('reset'); setError(''); setSuccess('') }}
              className="text-zinc-600 hover:text-[#FF6600] text-xs transition-colors"
            >
              Forgot password?
            </button>
          </p>
        )}

        <p className="text-center text-zinc-600 text-xs mt-6">
          No KYC. Privacy first.
        </p>
      </div>
    </div>
  )
}
