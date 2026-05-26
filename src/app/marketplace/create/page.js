'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { PAYMENT_METHODS, CURRENCIES, COUNTRIES } from '@/lib/constants'

export default function CreateListingPage() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [xmrPrice, setXmrPrice] = useState(null)

  const [form, setForm] = useState({
    type: 'sell',
    payment_method: 'bank_transfer',
    currency: 'EUR',
    country: 'DE',
    margin: 0,
    min_amount: 50,
    max_amount: 500,
    terms: '',
    payment_window_minutes: 30,
  })

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data?.user) router.push('/auth')
      else setUser(data.user)
    })
    fetchPrice()
  }, [])

  async function fetchPrice() {
    try {
      const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=monero&vs_currencies=eur,usd,gbp,chf')
      const data = await res.json()
      setXmrPrice(data.monero)
    } catch {}
  }

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }))
  }

  const effectivePrice = xmrPrice
    ? xmrPrice[form.currency.toLowerCase()] * (1 + form.margin / 100)
    : null

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single()

      if (!profile) throw new Error('Profile not found')

      const { data, error: insertError } = await supabase
        .from('listings')
        .insert({
          ...form,
          trader_id: user.id,
          margin: parseFloat(form.margin),
          min_amount: parseFloat(form.min_amount),
          max_amount: parseFloat(form.max_amount),
          payment_window_minutes: parseInt(form.payment_window_minutes),
        })
        .select()
        .single()

      if (insertError) throw insertError
      router.push(`/marketplace/${data.id}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Nav */}
      <nav className="border-b border-zinc-900 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg tracking-widest hover:text-[#FF6600] transition-colors">MONE.SO</Link>
        <Link href="/marketplace" className="text-zinc-400 hover:text-white text-sm transition-colors">← Back to Marketplace</Link>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold mb-1">Post an Offer</h1>
        <p className="text-zinc-500 text-sm mb-8">Set your terms — traders will find and contact you.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Buy / Sell */}
          <div>
            <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-2">Offer Type</label>
            <div className="flex border border-zinc-800 rounded-xl overflow-hidden">
              <button type="button" onClick={() => set('type', 'sell')}
                className={`flex-1 py-4 text-sm font-bold transition-colors ${form.type === 'sell' ? 'bg-[#FF6600] text-black' : 'text-zinc-400 hover:text-white'}`}>
                I'm Selling XMR
              </button>
              <button type="button" onClick={() => set('type', 'buy')}
                className={`flex-1 py-4 text-sm font-bold transition-colors ${form.type === 'buy' ? 'bg-green-500 text-black' : 'text-zinc-400 hover:text-white'}`}>
                I'm Buying XMR
              </button>
            </div>
          </div>

          {/* Payment + Currency + Country */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-2">Payment Method</label>
              <select value={form.payment_method} onChange={e => set('payment_method', e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FF6600]">
                {PAYMENT_METHODS.map(pm => <option key={pm.id} value={pm.id}>{pm.icon} {pm.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-2">Fiat Currency</label>
              <select value={form.currency} onChange={e => set('currency', e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FF6600]">
                {CURRENCIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-2">Country</label>
            <select value={form.country} onChange={e => set('country', e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FF6600]">
              {COUNTRIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </div>

          {/* Margin / Price */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5">
            <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-2">
              Price Margin (% above/below market)
            </label>
            <div className="flex items-center gap-4">
              <input type="range" min="-10" max="20" step="0.5" value={form.margin}
                onChange={e => set('margin', e.target.value)}
                className="flex-1 accent-[#FF6600]" />
              <span className="text-[#FF6600] font-bold w-16 text-right">
                {form.margin > 0 ? '+' : ''}{form.margin}%
              </span>
            </div>
            {effectivePrice && (
              <p className="text-xs text-zinc-400 mt-2">
                Your price: <span className="text-white font-medium">
                  {form.currency} {effectivePrice.toLocaleString('en', { maximumFractionDigits: 2 })}
                </span> / XMR
                <span className="text-zinc-600 ml-2">(market: {form.currency} {xmrPrice[form.currency.toLowerCase()]?.toLocaleString('en', { maximumFractionDigits: 2 })})</span>
              </p>
            )}
          </div>

          {/* Trade limits */}
          <div>
            <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-2">Trade Limits ({form.currency})</label>
            <div className="flex gap-4 items-center">
              <div className="flex-1">
                <input type="number" value={form.min_amount} onChange={e => set('min_amount', e.target.value)}
                  placeholder="Min" min="1"
                  className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FF6600] placeholder-zinc-600" />
                <p className="text-xs text-zinc-600 mt-1">Minimum</p>
              </div>
              <span className="text-zinc-600">—</span>
              <div className="flex-1">
                <input type="number" value={form.max_amount} onChange={e => set('max_amount', e.target.value)}
                  placeholder="Max" min="1"
                  className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FF6600] placeholder-zinc-600" />
                <p className="text-xs text-zinc-600 mt-1">Maximum</p>
              </div>
            </div>
          </div>

          {/* Payment window */}
          <div>
            <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-2">Payment Window</label>
            <select value={form.payment_window_minutes} onChange={e => set('payment_window_minutes', e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FF6600]">
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={60}>1 hour</option>
              <option value={120}>2 hours</option>
            </select>
            <p className="text-xs text-zinc-600 mt-1">How long the buyer has to send payment before the trade cancels.</p>
          </div>

          {/* Terms */}
          <div>
            <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-2">Trade Terms (optional)</label>
            <textarea
              value={form.terms}
              onChange={e => set('terms', e.target.value)}
              placeholder="Any specific requirements, instructions, or notes for traders..."
              rows={4}
              className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FF6600] placeholder-zinc-600 resize-none"
            />
          </div>

          {error && (
            <p className="text-red-400 text-xs bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">{error}</p>
          )}

          <button type="submit" disabled={loading}
            className="w-full bg-[#FF6600] hover:bg-[#e55a00] text-black font-bold py-4 rounded-xl text-sm transition-colors disabled:opacity-50">
            {loading ? 'Posting...' : 'Post Offer →'}
          </button>
        </form>
      </div>
    </div>
  )
}
