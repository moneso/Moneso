// build: 1781036573067
'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import TradeChat from '@/components/marketplace/TradeChat'
import { getPaymentMethod, getCurrency, TRADE_STATUS } from '@/lib/constants'

const ESCROW_ADDRESS = '45tdEMiE6MYTUnYwZm9W4yN3v7JXifEgDWZXdjApR1TUcaz59L28fpmcKVSX1vLhK7YgxpC6C18DEFEXRTErUcqB4iCZPwF'
const PLATFORM_FEE = 0.01

export default function ListingPage() {
  const { id } = useParams()
  const router = useRouter()
  const supabase = createClient()

  const [listing, setListing] = useState(null)
  const [user, setUser] = useState(null)
  const [xmrPrice, setXmrPrice] = useState(null)
  const [trade, setTrade] = useState(null)
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(true)
  const [starting, setStarting] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [completedTrade, setCompletedTrade] = useState(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user))
    fetchListing()
    fetchPrice()
  }, [id])

  useEffect(() => {
    if (user) fetchActiveTrade()
  }, [user, id])

  // Realtime trade updates
  useEffect(() => {
    if (!trade) return
    const channel = supabase
      .channel(`trade-status-${trade.id}`)
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'trades',
        filter: `id=eq.${trade.id}`
      }, (payload) => setTrade(payload.new))
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [trade?.id])

  async function fetchListing() {
    const { data } = await supabase
      .from('listings')
      .select('*, profiles(username, trade_count, positive_feedback, negative_feedback, is_online, created_at, xmr_address)')
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
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    if (data) {
      if (['completed', 'cancelled'].includes(data.status)) {
        setCompletedTrade(data)
        setTrade(null)
      } else {
        setTrade(data)
        setCompletedTrade(null)
      }
    }
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
      const xmrAmt = (fiatAmt / effectivePrice) * (1 - PLATFORM_FEE)
      const paymentId = id.replace(/-/g, '').substring(0, 16) + Date.now().toString(16).substring(0, 4)
      const isBuyerMe = listing.type === 'sell'

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
          escrow_address: ESCROW_ADDRESS,
          escrow_payment_id: paymentId,
          status: 'pending',
        })
        .select()
        .single()

      if (tradeError) throw tradeError

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
    await supabase.from('messages').insert({
      trade_id: trade.id,
      sender_id: user.id,
      content: `Status: ${TRADE_STATUS[newStatus]?.label}`,
      is_system: true,
    })
    if (newStatus === 'completed') {
      await supabase.rpc('increment_trade_count', { user_id: trade.buyer_id })
      await supabase.rpc('increment_trade_count', { user_id: trade.seller_id })
    }
    if (['completed', 'cancelled'].includes(newStatus)) {
      setCompletedTrade(data)
      setTrade(null)
    } else {
      setTrade(data)
    }
  }

  function copyAddress() {
    navigator.clipboard.writeText(ESCROW_ADDRESS)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-zinc-600">Loading...</div>
  if (!listing) return <div className="min-h-screen bg-black flex items-center justify-center text-zinc-600">Listing not found.</div>

  const pm = getPaymentMethod(listing.payment_method)
  const currency = getCurrency(listing.currency)
  const currentPrice = xmrPrice?.[listing.currency.toLowerCase()]
  const effectivePrice = currentPrice ? currentPrice * (1 + listing.margin / 100) : null
  const isOwnListing = user?.id === listing.trader_id
  const isSeller = (trade && user?.id === trade.seller_id) || (completedTrade && user?.id === completedTrade.seller_id)
  const isBuyer = (trade && user?.id === trade.buyer_id) || (completedTrade && user?.id === completedTrade.buyer_id)

  // Trade steps
  const steps = [
    { key: 'pending', label: 'Trade started' },
    { key: 'funded', label: 'XMR in escrow' },
    { key: 'paid', label: 'Payment sent' },
    { key: 'completed', label: 'Complete' },
  ]
  const currentStep = steps.findIndex(s => s.key === trade?.status)

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="border-b border-zinc-900 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg tracking-widest hover:text-[#FF6600]">MONE.SO</Link>
        <Link href="/marketplace" className="text-zinc-400 hover:text-white text-sm">← Marketplace</Link>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* Left: Listing details */}
          <div className="lg:col-span-3 space-y-5">
            <div className="border border-zinc-800 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-5">
                <span className={`text-xs font-bold px-2 py-1 rounded-md ${listing.type === 'sell' ? 'bg-[#FF6600]/10 text-[#FF6600]' : 'bg-green-400/10 text-green-400'}`}>
                  {listing.type === 'sell' ? 'SELLING XMR' : 'BUYING XMR'}
                </span>
                <span className="text-xs bg-zinc-900 text-zinc-300 px-2 py-1 rounded-md">{pm.icon} {pm.label}</span>
              </div>
              <p className="text-4xl font-bold text-[#FF6600] mb-1">
                {effectivePrice ? `${currency.symbol}${effectivePrice.toLocaleString('en', { maximumFractionDigits: 2 })}` : '—'}
                <span className="text-lg text-zinc-400 font-normal ml-2">/ XMR</span>
              </p>
              <p className="text-sm text-zinc-500 mb-5">{listing.margin > 0 ? `+${listing.margin}%` : listing.margin < 0 ? `${listing.margin}%` : 'at market'} above market</p>

              <div className="grid grid-cols-2 gap-3 text-sm mb-5">
                <div className="bg-zinc-950 rounded-lg p-3">
                  <p className="text-zinc-500 text-xs mb-1">Limits</p>
                  <p>{currency.symbol}{listing.min_amount} – {currency.symbol}{listing.max_amount}</p>
                </div>
                <div className="bg-zinc-950 rounded-lg p-3">
                  <p className="text-zinc-500 text-xs mb-1">Payment window</p>
                  <p>{listing.payment_window_minutes} min</p>
                </div>
              </div>

              {listing.terms && (
                <div className="bg-zinc-950 rounded-lg p-4">
                  <p className="text-zinc-500 text-xs mb-2 uppercase tracking-wider">Terms</p>
                  <p className="text-zinc-300 text-sm">{listing.terms}</p>
                </div>
              )}
            </div>

            {/* Trader */}
            <div className="border border-zinc-800 rounded-xl p-5">
              <p className="text-xs text-zinc-500 uppercase tracking-wider mb-3">Trader</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center font-bold text-[#FF6600]">
                  {listing.profiles.username[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-bold">{listing.profiles.username}</p>
                  <p className="text-sm text-zinc-500">{listing.profiles.trade_count} trades · Member since {new Date(listing.profiles.created_at).getFullYear()}</p>
                </div>
                <div className={`ml-auto w-2 h-2 rounded-full ${listing.profiles.is_online ? 'bg-green-400' : 'bg-zinc-600'}`} />
              </div>
            </div>
          </div>

          {/* Right: Trade panel */}
          <div className="lg:col-span-2 space-y-4">
            {trade && !['completed', 'cancelled'].includes(trade.status) ? (
              <div className="space-y-4">
                {/* Progress */}
                <div className="border border-zinc-800 rounded-xl p-5">
                  <p className="text-sm font-bold mb-4">Trade Progress</p>
                  <div className="space-y-2">
                    {steps.map((step, i) => (
                      <div key={step.key} className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                          i < currentStep ? 'bg-green-500 text-black' :
                          i === currentStep ? 'bg-[#FF6600] text-black' :
                          'bg-zinc-800 text-zinc-500'
                        }`}>
                          {i < currentStep ? '✓' : i + 1}
                        </div>
                        <p className={`text-sm ${i <= currentStep ? 'text-white' : 'text-zinc-600'}`}>{step.label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Trade details */}
                <div className="border border-zinc-800 rounded-xl p-5">
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Amount</span>
                      <span className="text-[#FF6600] font-bold">{trade.xmr_amount} XMR</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">You pay</span>
                      <span>{currency.symbol}{trade.fiat_amount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Rate</span>
                      <span>{currency.symbol}{trade.xmr_price_at_creation?.toLocaleString('en', { maximumFractionDigits: 2 })}</span>
                    </div>
                  </div>

                  {/* Escrow address — shown to seller when pending */}
                  {isSeller && trade.status === 'pending' && (
                    <div className="bg-zinc-950 border border-[#FF6600]/20 rounded-lg p-4 mb-4">
                      <p className="text-xs text-[#FF6600] uppercase tracking-wider mb-2">⚠️ Send XMR to Escrow</p>
                      <p className="text-xs text-zinc-400 mb-3">Send exactly <span className="text-white font-bold">{trade.xmr_amount} XMR</span> to this escrow address. The funds will be locked until the buyer confirms payment.</p>
                      <div className="bg-black rounded-lg p-3 font-mono text-xs text-zinc-300 break-all mb-2">
                        {ESCROW_ADDRESS}
                      </div>
                      <button onClick={copyAddress} className={`w-full py-2 rounded-lg text-xs font-bold transition-colors ${copied ? 'bg-green-500 text-black' : 'bg-zinc-800 hover:bg-zinc-700 text-white'}`}>
                        {copied ? '✓ Copied!' : 'Copy Address'}
                      </button>
                      <button onClick={() => updateTradeStatus('funded')}
                        className="w-full bg-[#FF6600] hover:bg-[#e55a00] text-black font-bold py-3 rounded-xl text-sm transition-colors mt-3">
                        I've Sent XMR to Escrow ✓
                      </button>
                    </div>
                  )}

                  {/* Waiting for escrow — shown to buyer when pending */}
                  {isBuyer && trade.status === 'pending' && (
                    <div className="bg-zinc-950 border border-zinc-700 rounded-lg p-4 mb-4">
                      <p className="text-xs text-zinc-400 uppercase tracking-wider mb-2">⏳ Waiting for seller</p>
                      <p className="text-sm text-zinc-300">The seller needs to send <span className="text-[#FF6600] font-bold">{trade.xmr_amount} XMR</span> to escrow first. You'll be notified automatically.</p>
                    </div>
                  )}

                  {/* Escrow funded — send payment now */}
                  {isBuyer && trade.status === 'funded' && (
                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-4">
                      <p className="text-xs text-green-400 uppercase tracking-wider mb-2">✅ XMR in Escrow</p>
                      <p className="text-sm text-zinc-300">
                        Send <span className="text-white font-bold">{currency.symbol}{trade.fiat_amount}</span> via <span className="text-white font-bold">{pm.label}</span> to the seller, then click "I've Paid".
                      </p>
                    </div>
                  )}

                  {/* Seller waiting for payment */}
                  {isSeller && trade.status === 'funded' && (
                    <div className="bg-zinc-950 border border-zinc-700 rounded-lg p-4 mb-4">
                      <p className="text-xs text-zinc-400 uppercase tracking-wider mb-2">⏳ Waiting for payment</p>
                      <p className="text-sm text-zinc-300">XMR is locked in escrow. Waiting for buyer to send <span className="text-white font-bold">{currency.symbol}{trade.fiat_amount}</span> via {pm.label}.</p>
                    </div>
                  )}

                  {/* Payment sent — seller releases */}
                  {isSeller && trade.status === 'paid' && (
                    <div className="bg-[#FF6600]/10 border border-[#FF6600]/20 rounded-lg p-4 mb-4">
                      <p className="text-xs text-[#FF6600] uppercase tracking-wider mb-2">💰 Payment Received?</p>
                      <p className="text-sm text-zinc-300">Check your {pm.label} account. If you received <span className="text-white font-bold">{currency.symbol}{trade.fiat_amount}</span>, release the XMR to the buyer.</p>
                    </div>
                  )}

                  {/* Action buttons */}
                  {isSeller && trade.status === 'funded' && (
                    <p className="text-xs text-zinc-600 text-center mb-3">XMR is safely locked. Waiting for buyer payment.</p>
                  )}

                  {isBuyer && trade.status === 'funded' && (
                    <button onClick={() => updateTradeStatus('paid')}
                      className="w-full bg-[#FF6600] hover:bg-[#e55a00] text-black font-bold py-3 rounded-xl text-sm transition-colors mb-2">
                      I've Sent Payment ✓
                    </button>
                  )}

                  {isSeller && trade.status === 'paid' && (
                    <button onClick={() => updateTradeStatus('completed')}
                      className="w-full bg-green-500 hover:bg-green-600 text-black font-bold py-3 rounded-xl text-sm transition-colors mb-2">
                      Release XMR to Buyer ✓
                    </button>
                  )}

                  {isBuyer && trade.status === 'paid' && (
                    <div className="bg-zinc-950 border border-zinc-700 rounded-lg p-4">
                      <p className="text-sm text-zinc-300">⏳ Waiting for seller to confirm payment and release XMR...</p>
                    </div>
                  )}

                  {trade.status === 'completed' && (
                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                      <p className="text-green-400 font-bold text-center">🎉 Trade Complete!</p>
                      {isBuyer && <p className="text-sm text-zinc-400 text-center mt-1">The seller will release XMR to your wallet address.</p>}
                {isSeller && <p className="text-sm text-zinc-400 text-center mt-1">Release XMR from your escrow wallet to the buyer's address.</p>}
                    </div>
                  )}

                  {['pending', 'funded'].includes(trade.status) && (
                    <button onClick={() => updateTradeStatus('cancelled')}
                      className="w-full border border-zinc-800 hover:border-red-400/30 text-zinc-500 hover:text-red-400 py-2 rounded-xl text-xs transition-colors mt-2">
                      Cancel Trade
                    </button>
                  )}

                  {['funded', 'paid'].includes(trade.status) && (
                    <button onClick={() => updateTradeStatus('disputed')}
                      className="w-full border border-zinc-800 hover:border-yellow-400/30 text-zinc-500 hover:text-yellow-400 py-2 rounded-xl text-xs transition-colors mt-1">
                      Open Dispute
                    </button>
                  )}
                </div>

                {/* Chat */}
                {user && (
                  <div className="h-96">
                    <TradeChat tradeId={trade.id} currentUserId={user.id} />
                  </div>
                )}
              </div>
                        ) : completedTrade ? (
              <div className="border border-zinc-800 rounded-xl p-5 space-y-4">
                <div className={completedTrade.status === 'completed' ? 'bg-green-500/10 border border-green-500/20 rounded-xl p-5 text-center' : 'bg-zinc-900 border border-zinc-700 rounded-xl p-5 text-center'}>
                  <p className={completedTrade.status === 'completed' ? 'text-green-400 font-bold text-xl mb-2' : 'text-zinc-400 font-bold text-xl mb-2'}>
                    {completedTrade.status === 'completed' ? '🎉 Trade Complete!' : '❌ Trade Cancelled'}
                  </p>
                  {completedTrade.status === 'completed' && isSeller && (
                    <p className="text-sm text-zinc-300 mb-1">Send <span className="text-white font-bold">{completedTrade.xmr_amount} XMR</span> from your escrow wallet to the buyer now.</p>
                  )}
                  {completedTrade.status === 'completed' && isBuyer && (
                    <p className="text-sm text-zinc-300 mb-1">The seller will send <span className="text-white font-bold">{completedTrade.xmr_amount} XMR</span> to your wallet.</p>
                  )}
                  {completedTrade.status === 'cancelled' && (
                    <p className="text-sm text-zinc-400">This trade was cancelled. No funds were exchanged.</p>
                  )}
                </div>
                <div className="border border-zinc-800 rounded-xl p-4 text-sm space-y-2">
                  <div className="flex justify-between"><span className="text-zinc-500">Amount</span><span className="text-[#FF6600] font-bold">{completedTrade.xmr_amount} XMR</span></div>
                  <div className="flex justify-between"><span className="text-zinc-500">Fiat</span><span>{completedTrade.currency} {completedTrade.fiat_amount}</span></div>
                  <div className="flex justify-between"><span className="text-zinc-500">Rate</span><span>{completedTrade.currency} {completedTrade.xmr_price_at_creation?.toLocaleString('en', { maximumFractionDigits: 2 })}</span></div>
                </div>
                <Link href="/account" className="block w-full text-center bg-zinc-900 hover:bg-zinc-800 text-white font-bold py-3 rounded-xl text-sm transition-colors">
                  View in Account History →
                </Link>
                <Link href="/marketplace" className="block w-full text-center border border-zinc-800 hover:border-[#FF6600] text-zinc-400 hover:text-[#FF6600] font-bold py-3 rounded-xl text-sm transition-colors">
                  Back to Marketplace
                </Link>
              </div>
) : isOwnListing ? (
              <div className="border border-zinc-800 rounded-xl p-5 text-center">
                <p className="text-zinc-500 text-sm">This is your listing.</p>
                <Link href="/marketplace" className="text-[#FF6600] text-sm hover:underline mt-2 block">← Browse other offers</Link>
              </div>
            ) : (
              <div className="border border-zinc-800 rounded-xl p-5">
                <p className="text-sm font-bold mb-4">Start Trade</p>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-2">Amount ({listing.currency})</label>
                    <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
                      placeholder={`${listing.min_amount} – ${listing.max_amount}`}
                      className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FF6600] placeholder-zinc-600" />
                    {amount && effectivePrice && (
                      <p className="text-xs text-zinc-400 mt-1.5">
                        You get: <span className="text-[#FF6600] font-bold">{((parseFloat(amount) / effectivePrice) * (1 - PLATFORM_FEE)).toFixed(6)} XMR</span>
                        <span className="text-zinc-600 ml-1">(after 1% fee)</span>
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
                    <Link href="/auth" className="block w-full text-center bg-zinc-900 hover:bg-zinc-800 text-white font-bold py-3 rounded-xl text-sm transition-colors">
                      Login to Trade
                    </Link>
                  )}
                  <p className="text-xs text-zinc-600 text-center">XMR held in escrow until payment confirmed</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
