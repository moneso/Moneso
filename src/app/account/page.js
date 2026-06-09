'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { getPaymentMethod, getCurrency } from '@/lib/constants'

export default function AccountPage() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [listings, setListings] = useState([])
  const [trades, setTrades] = useState([])
  const [loading, setLoading] = useState(true)
  const [xmrAddress, setXmrAddress] = useState('')
  const [savingAddress, setSavingAddress] = useState(false)
  const [addressSaved, setAddressSaved] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data?.user) { router.push('/auth'); return }
      setUser(data.user)
      fetchData(data.user.id)
    })
  }, [])

  useEffect(() => {
    if (!user) return
    const interval = setInterval(() => fetchData(user.id), 15000)
    return () => clearInterval(interval)
  }, [user])

  async function fetchData(userId) {
    const [{ data: prof }, { data: list }, { data: tr }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).single(),
      supabase.from('listings').select('*').eq('trader_id', userId).order('created_at', { ascending: false }),
      supabase.from('trades').select('*').or(`buyer_id.eq.${userId},seller_id.eq.${userId}`).order('created_at', { ascending: false }).limit(20),
    ])
    setProfile(prof)
    setXmrAddress(prof?.xmr_address || '')
    setListings(list || [])
    setTrades(tr || [])
    setLoading(false)
  }

  async function saveXmrAddress() {
    setSavingAddress(true)
    await supabase.from('profiles').update({ xmr_address: xmrAddress }).eq('id', user.id)
    setSavingAddress(false)
    setAddressSaved(true)
    setTimeout(() => setAddressSaved(false), 3000)
  }

  async function deleteListing(id) {
    await supabase.from('listings').update({ is_active: false }).eq('id', id)
    setListings(prev => prev.filter(l => l.id !== id))
  }

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-zinc-600">Loading...</div>

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="border-b border-zinc-900 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg tracking-widest hover:text-[#FF6600] transition-colors">MONE.SO</Link>
        <div className="flex items-center gap-4">
          <Link href="/marketplace" className="text-zinc-400 hover:text-white text-sm transition-colors">Marketplace</Link>
          <button onClick={signOut} className="text-zinc-500 hover:text-red-400 text-sm transition-colors">Sign out</button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-14 h-14 rounded-full bg-zinc-900 flex items-center justify-center text-2xl font-bold text-[#FF6600]">
            {profile?.username?.[0]?.toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{profile?.username}</h1>
            <p className="text-zinc-500 text-sm">{profile?.trade_count} trades · Member since {new Date(profile?.created_at).getFullYear()}</p>
          </div>
          <Link href="/marketplace/create" className="ml-auto bg-[#FF6600] hover:bg-[#e55a00] text-black font-bold px-5 py-2.5 rounded-xl text-sm transition-colors">
            + Post Offer
          </Link>
        </div>

        <div className="space-y-8">
          <div className="border border-zinc-800 rounded-xl p-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-500 mb-1">Your Monero Wallet</h2>
            <p className="text-xs text-zinc-600 mb-4">Buyers will send XMR to this address when you're selling. Required to trade.</p>
            <div className="flex gap-3">
              <input type="text" value={xmrAddress} onChange={e => setXmrAddress(e.target.value)}
                placeholder="4... (your XMR receiving address)"
                className="flex-1 bg-zinc-900 border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FF6600] placeholder-zinc-600 font-mono" />
              <button onClick={saveXmrAddress} disabled={savingAddress}
                className={`px-5 py-3 rounded-xl text-sm font-bold transition-colors ${addressSaved ? 'bg-green-500 text-black' : 'bg-[#FF6600] hover:bg-[#e55a00] text-black'} disabled:opacity-50`}>
                {savingAddress ? '...' : addressSaved ? '✓ Saved!' : 'Save'}
              </button>
            </div>
            {xmrAddress && <p className="text-xs text-zinc-600 mt-2 font-mono truncate">{xmrAddress}</p>}
          </div>

          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-500 mb-4">My Listings</h2>
            {listings.length === 0 ? (
              <p className="text-zinc-600 text-sm">No listings yet. <Link href="/marketplace/create" className="text-[#FF6600] hover:underline">Post your first offer →</Link></p>
            ) : (
              <div className="space-y-3">
                {listings.map(listing => {
                  const pm = getPaymentMethod(listing.payment_method)
                  const curr = getCurrency(listing.currency)
                  return (
                    <div key={listing.id} className="border border-zinc-800 rounded-xl p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-bold px-2 py-1 rounded-md ${listing.type === 'sell' ? 'bg-[#FF6600]/10 text-[#FF6600]' : 'bg-green-400/10 text-green-400'}`}>
                          {listing.type === 'sell' ? 'SELLING' : 'BUYING'}
                        </span>
                        <span className="text-sm text-white">{pm.icon} {pm.label}</span>
                        <span className="text-sm text-zinc-400">{curr.symbol}{listing.min_amount}–{curr.symbol}{listing.max_amount}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${listing.is_active ? 'bg-green-400/10 text-green-400' : 'bg-zinc-800 text-zinc-500'}`}>
                          {listing.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link href={`/marketplace/${listing.id}`} className="text-xs text-zinc-400 hover:text-white px-3 py-1.5 border border-zinc-800 rounded-lg transition-colors">View</Link>
                        {listing.is_active && (
                          <button onClick={() => deleteListing(listing.id)} className="text-xs text-red-400 hover:text-red-300 px-3 py-1.5 border border-red-400/20 hover:border-red-400/40 rounded-lg transition-colors">Delete</button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-500 mb-4">Recent Trades</h2>
            {trades.length === 0 ? (
              <p className="text-zinc-600 text-sm">No trades yet.</p>
            ) : (
              <div className="space-y-3">
                {trades.filter(t => t && t.id).map(trade => (
                  <div key={trade.id} className="border border-zinc-800 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-white font-bold">{trade.xmr_amount || '—'} XMR</span>
                        <span className="text-sm text-zinc-400">for {trade.currency || ''} {trade.fiat_amount || ''}</span>
                      </div>
                      <span className={`text-xs font-bold ${trade.status === 'completed' ? 'text-green-400' : trade.status === 'cancelled' ? 'text-zinc-500' : trade.status === 'disputed' ? 'text-red-400' : 'text-yellow-400'}`}>
                        {(trade.status || 'unknown').toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-zinc-500">
                        {trade.created_at ? new Date(trade.created_at).toLocaleString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                      </span>
                      <Link href={`/marketplace/${trade.listing_id || ''}`} className="text-xs text-zinc-400 hover:text-white px-3 py-1.5 border border-zinc-800 rounded-lg transition-colors">View</Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
