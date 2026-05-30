'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import ListingCard from '@/components/marketplace/ListingCard'
import { PAYMENT_METHODS, CURRENCIES, COUNTRIES } from '@/lib/constants'

export default function MarketplacePage() {
  const supabase = createClient()
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [xmrPrice, setXmrPrice] = useState(null)
  const [user, setUser] = useState(null)

  // Filters
  const [type, setType] = useState('sell')  // 'sell' = sellers listing, buyer sees "Buy XMR"
  const [paymentMethod, setPaymentMethod] = useState('')
  const [currency, setCurrency] = useState('EUR')
  const [amount, setAmount] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user))
    fetchPrice()
    fetchListings()
  }, [type, paymentMethod, currency])

  async function fetchPrice() {
    try {
      const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=monero&vs_currencies=usd,eur,gbp,chf')
      const data = await res.json()
      setXmrPrice(data.monero)
    } catch {}
  }

  async function fetchListings() {
    setLoading(true)
    let query = supabase
      .from('listings')
      .select(`
        *,
        profiles (username, trade_count, positive_feedback, negative_feedback, is_online)
      `)
      .eq('is_active', true)
      .eq('type', type)
      .eq('currency', currency)
      .order('created_at', { ascending: false })

    if (paymentMethod) query = query.eq('payment_method', paymentMethod)

    const { data, error } = await query
    if (!error) setListings(data || [])
    setLoading(false)
  }

  const currentPrice = xmrPrice?.[currency.toLowerCase()] || xmrPrice?.eur

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Nav */}
      <nav className="border-b border-zinc-900 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg tracking-widest hover:text-[#FF6600] transition-colors">
          MONE.SO
        </Link>
        <div className="flex items-center gap-6 text-sm text-zinc-300">
          <Link href="/" className="hover:text-white transition-colors">Markets</Link>
          <Link href="/marketplace" className="text-[#FF6600]">Marketplace</Link>
          <Link href="/guides" className="hover:text-white transition-colors">Guides</Link>
          <Link href="/news" className="hover:text-white transition-colors">News</Link>
          {user ? (
            <Link href="/account" className="text-zinc-400 hover:text-white text-sm transition-colors mr-2">Account</a> <a href="/marketplace/create" className="bg-[#FF6600] hover:bg-[#e55a00] text-black font-bold px-4 py-1.5 rounded-lg text-xs transition-colors">
              + Post Offer
            </Link>
          ) : (
            <Link href="/auth" className="bg-zinc-800 hover:bg-zinc-700 text-white font-medium px-4 py-1.5 rounded-lg text-xs transition-colors">
              Login
            </Link>
          )}
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-1">P2P Marketplace</h1>
          <p className="text-zinc-300 text-sm">Buy and sell Monero privately. No KYC. No intermediaries.</p>
          {currentPrice && (
            <p className="text-xs text-zinc-300 mt-1">
              Market price: <span className="text-[#FF6600]">{currency} {currentPrice.toLocaleString('en', { maximumFractionDigits: 2 })}</span> / XMR
            </p>
          )}
        </div>

        {/* Filters */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 mb-8">
          <div className="flex flex-wrap gap-4 items-end">
            {/* Buy / Sell toggle */}
            <div>
              <label className="block text-xs text-zinc-300 uppercase tracking-wider mb-2">I want to</label>
              <div className="flex border border-zinc-800 rounded-lg overflow-hidden">
                <button
                  onClick={() => setType('sell')}
                  className={`px-5 py-2 text-sm font-medium transition-colors ${type === 'sell' ? 'bg-[#FF6600] text-black' : 'text-zinc-300 hover:text-white'}`}
                >
                  Buy XMR
                </button>
                <button
                  onClick={() => setType('buy')}
                  className={`px-5 py-2 text-sm font-medium transition-colors ${type === 'buy' ? 'bg-green-500 text-black' : 'text-zinc-300 hover:text-white'}`}
                >
                  Sell XMR
                </button>
              </div>
            </div>

            {/* Currency */}
            <div>
              <label className="block text-xs text-zinc-300 uppercase tracking-wider mb-2">Currency</label>
              <select
                value={currency}
                onChange={e => setCurrency(e.target.value)}
                className="bg-zinc-900 border border-zinc-800 text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#FF6600]"
              >
                {CURRENCIES.map(c => (
                  <option key={c.id} value={c.id}>{c.id}</option>
                ))}
              </select>
            </div>

            {/* Payment method */}
            <div>
              <label className="block text-xs text-zinc-300 uppercase tracking-wider mb-2">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value)}
                className="bg-zinc-900 border border-zinc-800 text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#FF6600]"
              >
                <option value="">All methods</option>
                {PAYMENT_METHODS.map(pm => (
                  <option key={pm.id} value={pm.id}>{pm.icon} {pm.label}</option>
                ))}
              </select>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-xs text-zinc-300 uppercase tracking-wider mb-2">Amount ({currency})</label>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="e.g. 100"
                className="bg-zinc-900 border border-zinc-800 text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#FF6600] placeholder-zinc-600 w-32"
              />
            </div>

            <button
              onClick={fetchListings}
              className="bg-[#FF6600] hover:bg-[#e55a00] text-black font-bold px-5 py-2 rounded-lg text-sm transition-colors"
            >
              Search
            </button>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="text-center py-20 text-zinc-300">Loading offers...</div>
        ) : listings.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-zinc-300 mb-4">No offers found for these filters.</p>
            {user && (
              <Link href="/marketplace/create" className="text-[#FF6600] text-sm hover:underline">
                Be the first to post an offer →
              </Link>
            )}
          </div>
        ) : (
          <>
            <p className="text-xs text-zinc-300 mb-4">{listings.length} offer{listings.length !== 1 ? 's' : ''} found</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {listings.map(listing => (
                <ListingCard key={listing.id} listing={listing} currentXmrPrice={currentPrice} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
