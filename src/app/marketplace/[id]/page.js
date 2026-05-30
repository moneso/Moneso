'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import TradeChat from '@/components/marketplace/TradeChat'
import { getPaymentMethod, getCurrency, formatReputation, TRADE_STATUS } from '@/lib/constants'

export default function ListingPage() {
  const { id } = useParams()
  const router = useRouter()
  const supabase = createClient()

  const [listing, setListing] = useState(null)
  const [user, setUser] = useState(null)
  const [xmrPrice, setXmrPrice] = useState(null)
  const [trade, setTrade] = useState(null)         // active trade for this listing+user
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(true)
  const [starting, setStarting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user))
    fetchListing()
    fetchPrice()
  }, [id])

  useEffect(() => {
    if (user) fetchActiveTrade()
  }, [user, id])

  async function fetchListing() {
    const { data } = await supabase
      .from('listings')
      .select('*, profiles(username, trade_count, positive_feedback, negative_feedback, is_online, created_at)')
      .eq('id', id)
      .single()
    setListing(data)
    setLoading(false)
  }

  async function fetchPrice() {
    try {
      const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=monero&vs_currencies=eur,usd,gbp,chf')
      const data = await res.json()
      setXmrPrice(data.monero)
    } catch {}
  }

  async function fetchActiveTrade() {
    const { data } = await supabase
      .from('trades')
      .select('*')
      .eq('listing_id', id)
      .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
      .not('status', 'in', '("completed","cancelled")')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    if (data) setTrade(data)
  }

  async function startTrade() {
    if (!user) { router.push('/auth'); return }
    if (!amount || parseFloat(amount) <= 0) { setError('Enter a valid amount.'); return }

    const fiatAmt = parseFloat(amount)
    if (fiatAmt < listing.min_amount || fiatAmt > listing.max_amount) {
      setError(`Amount must be between ${listing.min_amount} and ${listing.max_amount} ${listing.currency}`)
      return
    }

    setError('')
    setStarting(true)

    try {
      const currentPrice = xmrPrice?.[listing.currency.toLowerCase()] || 1
      const effectivePrice = currentPrice * (1 + listing.margin / 100)
      const PLATFORM_FEE = 0.01
      const xmrAmt = (fiatAmt / effectivePrice) * (1 - PLATFORM_FEE)

      const isBuyerMe = listing.type === 'sell'  // listing is selling XMR → I'm buying

      const { data, error: tradeError } = await supabase
        .from('trades')
        .insert({
          listing_id: listing.id,
          buyer_id: isBuyerMe ? user.id : listing.trader_id,
          seller_id: isBuyerMe ? listing.trader_id : user.id,
          fiat_amount: fiatAmt,
          xmr_amount: parseFloat(xmrAmt.toFixed(8)),
          xmr_price_at_creation: effectivePrice,
          payment_method: listing.payment_method,
          currency: listing.currency,
          status: 'pending',
        })
        .select()
        .single()

      if (tradeError) throw tradeError

      // System message
      await supabase.from('messages').insert({
        trade_id: data.id,
        sender_id: user.id,
        content: `Trade started: ${fiatAmt} ${listing.currency} for ${xmrAmt.toFixed(6)} XMR`,
        is_system: true,
      })

      setTrade(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setStarting(false)
    }
  }

  async function updateTradeStatus(newStatus) {
    const { data } = await supabase
      .from('trades')
      .update({ status: newStatus, [`${newStatus}_at`]: new Date().toISOString() })
      .eq('id', trade.id)
      .select()
      .single()

    // System message
    await supabase.from('messages').insert({
      trade_id: trade.id,
      sender_id: user.id,
      content: `Status updated: ${TRADE_STATUS[newStatus]?.label}`,
      is_system: true,
    })

    setTrade(data)
  }

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-zinc-600">Loading...</div>
  if (!listing) return <div className="min-h-screen bg-black flex items-center justify-center text-zinc-600">Listing not found.</div>

  const pm = getPaymentMethod(listing.payment_method)
  const currency = getCurrency(listing.currency)
  const rep = formatReputation(listing.profiles)
  const currentPrice = xmrPrice?.[listing.currency.toLowerCase()]
  const effectivePrice = currentPrice ? currentPrice * (1 + listing.margin / 100) : null
  const isOwnListing = user?.id === listing.trader_id

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Nav */}
      <nav className="border-b border-zinc-900 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg tracking-widest hover:text-[#FF6600] transition-colors">MONE.SO</Link>
        <Link href="/marketplace" className="text-zinc-400 hover:text-white text-sm transition-colors">← Marketplace</Link>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left: Listing details */}
          <div className="lg:col-span-3 space-y-6">
            {/* Offer header */}
            <div className="border border-zinc-800 rounded-xl p-6">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-md mr-2 ${listing.type === 'sell' ? 'bg-[#FF6600]/10 text-[#FF6600]' : 'bg-green-400/10 text-green-400'}`}>
                    {listing.type === 'sell' ? 'SELLING XMR' : 'BUYING XMR'}
                  </span>
                  <span className="text-xs bg-zinc-800 text-zinc-300 px-2 py-1 rounded-md">{pm.icon} {pm.label}</span>
                </div>
                {!listing.is_active && (
                  <span className="text-xs text-zinc-500 bg-zinc-900 px-3 py-1 rounded-full">Inactive</span>
                )}
              </div>

              {/* Price */}
              <div className="mb-5">
                <p className="text-4xl font-bold text-[#FF6600]">
                  {effectivePrice ? `${currency.symbol}${effectivePrice.toLocaleString('en', { maximumFractionDigits: 2 })}` : '—'}
                  <span className="text-lg text-zinc-400 font-normal ml-2">/ XMR</span>
                </p>
                <p className="text-sm text-zinc-500 mt-1">
                  {listing.margin > 0 ? `+${listing.margin}%` : listing.margin < 0 ? `${listing.margin}%` : 'at market'} above market price
                </p>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-zinc-950 rounded-lg p-3">
                  <p className="text-zinc-500 text-xs mb-1">Trade Limits</p>
                  <p className="text-white">{currency.symbol}{listing.min_amount} – {currency.symbol}{listing.max_amount}</p>
                </div>
                <div className="bg-zinc-950 rounded-lg p-3">
                  <p className="text-zinc-500 text-xs mb-1">Payment Window</p>
                  <p className="text-white">{listing.payment_window_minutes} minutes</p>
                </div>
                <div className="bg-zinc-950 rounded-lg p-3">
                  <p className="text-zinc-500 text-xs mb-1">Currency</p>
                  <p className="text-white">{listing.currency}</p>
                </div>
                <div className="bg-zinc-950 rounded-lg p-3">
                  <p className="text-zinc-500 text-xs mb-1">Payment Method</p>
                  <p className="text-white">{pm.icon} {pm.label}</p>
                </div>
              </div>

              {/* Terms */}
              {listing.terms && (
                <div className="mt-4 bg-zinc-950 rounded-lg p-4">
                  <p className="text-zinc-500 text-xs mb-2 uppercase tracking-wider">Trader's Terms</p>
                  <p className="text-zinc-300 text-sm leading-relaxed">{listing.terms}</p>
                </div>
              )}
            </div>

            {/* Trader profile */}
            <div className="border border-zinc-800 rounded-xl p-6">
              <p className="text-xs text-zinc-500 uppercase tracking-wider mb-4">Trader</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-xl font-bold text-[#FF6600]">
                  {listing.profiles.username[0].toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-white font-bold">{listing.profiles.username}</p>
                    <div className={`w-2 h-2 rounded-full ${listing.profiles.is_online ? 'bg-green-400' : 'bg-zinc-600'}`} />
                  </div>
                  <div className="flex items-center gap-3 text-sm text-zinc-500 mt-0.5">
                    <span>{listing.profiles.trade_count} trades</span>
                    <span className={rep.score >= 90 ? 'text-green-400' : 'text-yellow-400'}>
                      {rep.score}% positive
                    </span>
                    <span>Member since {new Date(listing.profiles.created_at).getFullYear()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Trade panel + chat */}
          <div className="lg:col-span-2 space-y-4">
            {trade ? (
              /* Active trade panel */
              <div className="border border-zinc-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold">Active Trade</p>
                  <span className={`text-xs font-bold ${TRADE_STATUS[trade.status]?.color}`}>
                    {TRADE_STATUS[trade.status]?.label}
                  </span>
                </div>

                <div className="bg-zinc-950 rounded-lg p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">You pay</span>
                    <span className="text-white font-medium">{currency.symbol}{trade.fiat_amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">You receive</span>
                    <span className="text-[#FF6600] font-bold">{trade.xmr_amount} XMR</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Rate</span>
                    <span className="text-white">{currency.symbol}{trade.xmr_price_at_creation.toLocaleString('en', { maximumFractionDigits: 2 })}</span>
                  </div>
                </div>

                {/* Status actions */}
                {trade.status === 'pending' && user?.id === trade.seller_id && (
                  <button onClick={() => updateTradeStatus('funded')}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-lg text-sm transition-colors">
                    I've sent XMR to Escrow ✓
                  </button>
                )}
                {trade.status === 'funded' && user?.id === trade.buyer_id && (
                  <button onClick={() => updateTradeStatus('paid')}
                    className="w-full bg-[#FF6600] hover:bg-[#e55a00] text-black font-bold py-3 rounded-lg text-sm transition-colors">
                    I've Sent Payment ✓
                  </button>
                )}
                {trade.status === 'paid' && user?.id === trade.seller_id && (
                  <button onClick={() => updateTradeStatus('completed')}
                    className="w-full bg-green-500 hover:bg-green-600 text-black font-bold py-3 rounded-lg text-sm transition-colors">
                    Release XMR ✓
                  </button>
                )}
                {['pending', 'funded'].includes(trade.status) && (
                  <button onClick={() => updateTradeStatus('cancelled')}
                    className="w-full border border-zinc-700 hover:border-red-400/50 text-zinc-400 hover:text-red-400 py-2.5 rounded-lg text-sm transition-colors">
                    Cancel Trade
                  </button>
                )}
                {['funded', 'paid'].includes(trade.status) && (
                  <button onClick={() => updateTradeStatus('disputed')}
                    className="w-full border border-zinc-700 hover:border-yellow-400/50 text-zinc-400 hover:text-yellow-400 py-2.5 rounded-lg text-xs transition-colors">
                    Open Dispute
                  </button>
                )}
              </div>
            ) : isOwnListing ? (
              <div className="border border-zinc-800 rounded-xl p-5 text-center">
                <p className="text-zinc-500 text-sm">This is your listing.</p>
                <Link href="/marketplace" className="text-[#FF6600] text-sm hover:underline mt-2 block">← Browse other offers</Link>
              </div>
            ) : (
              /* Start trade form */
              <div className="border border-zinc-800 rounded-xl p-5">
                <p className="text-sm font-bold mb-4">Start Trade</p>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-2">
                      Amount ({listing.currency})
                    </label>
                    <input
                      type="number"
                      value={amount}
                      onChange={e => setAmount(e.target.value)}
                      placeholder={`${listing.min_amount} – ${listing.max_amount}`}
                      min={listing.min_amount}
                      max={listing.max_amount}
                      className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FF6600] placeholder-zinc-600"
                    />
                    {amount && effectivePrice && (
                      <p className="text-xs text-zinc-400 mt-1.5">
                        You receive (after 1% fee): <span className="text-[#FF6600] font-bold">{(parseFloat(amount) / effectivePrice).toFixed(6)} XMR</span>
                      </p>
                    )}
                  </div>

                  {error && <p className="text-red-400 text-xs">{error}</p>}

                  {user ? (
                    <button onClick={startTrade} disabled={starting}
                      className="w-full bg-[#FF6600] hover:bg-[#e55a00] text-black font-bold py-3 rounded-xl text-sm transition-colors disabled:opacity-50">
                      {starting ? 'Starting...' : listing.type === 'sell' ? 'Buy XMR →' : 'Sell XMR →'}
                    </button>
                  ) : (
                    <Link href="/auth" className="block w-full text-center bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 rounded-xl text-sm transition-colors">
                      Login to Trade
                    </Link>
                  )}
                </div>
              </div>
            )}

            {/* Chat — only show if trade is active */}
            {trade && user && (
              <div className="h-96">
                <TradeChat tradeId={trade.id} currentUserId={user.id} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
