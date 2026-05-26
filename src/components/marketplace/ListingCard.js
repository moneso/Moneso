import Link from 'next/link'
import { getPaymentMethod, getCurrency, formatReputation } from '@/lib/constants'

export default function ListingCard({ listing, currentXmrPrice }) {
  const pm = getPaymentMethod(listing.payment_method)
  const currency = getCurrency(listing.currency)
  const rep = formatReputation(listing.profiles)

  // Calculate actual price with margin
  const price = currentXmrPrice
    ? currentXmrPrice * (1 + listing.margin / 100)
    : null

  const isBuy = listing.type === 'buy'

  return (
    <div className="border border-zinc-800 hover:border-zinc-600 rounded-xl p-5 transition-all group bg-zinc-950/50">
      <div className="flex items-start justify-between mb-4">
        {/* Trader info */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center text-sm font-bold text-[#FF6600]">
            {listing.profiles.username[0].toUpperCase()}
          </div>
          <div>
            <p className="text-white text-sm font-medium">{listing.profiles.username}</p>
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <span>{listing.profiles.trade_count} trades</span>
              <span>·</span>
              <span className={rep.score >= 90 ? 'text-green-400' : rep.score >= 70 ? 'text-yellow-400' : 'text-red-400'}>
                {rep.score}% pos
              </span>
            </div>
          </div>
        </div>

        {/* Online indicator */}
        <div className="flex items-center gap-1.5">
          <div className={`w-1.5 h-1.5 rounded-full ${listing.profiles.is_online ? 'bg-green-400' : 'bg-zinc-600'}`} />
          <span className="text-xs text-zinc-500">{listing.profiles.is_online ? 'online' : 'offline'}</span>
        </div>
      </div>

      {/* Offer type badge + payment */}
      <div className="flex items-center gap-2 mb-4">
        <span className={`text-xs font-bold px-2 py-1 rounded-md ${isBuy ? 'bg-green-400/10 text-green-400' : 'bg-red-400/10 text-red-400'}`}>
          {isBuy ? 'BUYING XMR' : 'SELLING XMR'}
        </span>
        <span className="text-xs bg-zinc-800 text-zinc-300 px-2 py-1 rounded-md">
          {pm.icon} {pm.label}
        </span>
      </div>

      {/* Price + limits */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[#FF6600] font-bold text-lg">
            {price ? `${currency.symbol}${price.toLocaleString('en', { maximumFractionDigits: 0 })}` : '—'} <span className="text-sm font-normal text-zinc-400">/ XMR</span>
          </p>
          <p className="text-xs text-zinc-500 mt-0.5">
            {listing.margin > 0 ? `+${listing.margin}%` : listing.margin < 0 ? `${listing.margin}%` : 'at market'} · {listing.currency}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-zinc-400">
            {currency.symbol}{listing.min_amount.toLocaleString()} – {currency.symbol}{listing.max_amount.toLocaleString()}
          </p>
          <p className="text-xs text-zinc-600">limit</p>
        </div>
      </div>

      {/* CTA */}
      <Link
        href={`/marketplace/${listing.id}`}
        className={`mt-4 block w-full text-center py-2.5 rounded-lg text-sm font-bold transition-colors ${
          isBuy
            ? 'bg-green-400/10 hover:bg-green-400/20 text-green-400 border border-green-400/20'
            : 'bg-[#FF6600]/10 hover:bg-[#FF6600]/20 text-[#FF6600] border border-[#FF6600]/20'
        }`}
      >
        {isBuy ? 'Sell XMR →' : 'Buy XMR →'}
      </Link>
    </div>
  )
}
