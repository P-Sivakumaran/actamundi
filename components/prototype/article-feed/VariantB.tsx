// Variant B — Full-bleed vertical snap feed, one article per screen.
// Bet: literal TikTok-format transplant. Verification badge has to win
// against a full-bleed photo and a gradient, which is the actual test of
// whether "surfaced inline" survives contact with an image-forward format.

import Image from 'next/image'
import { Clock } from 'lucide-react'
import { MOCK_ARTICLES } from './mock-articles'
import { VerificationBadge } from './VerificationBadge'

export function VariantB() {
  return (
    <div className="mx-auto max-w-[430px] rounded-2xl border bg-black overflow-hidden">
      <div
        className="h-[75vh] overflow-y-scroll snap-y snap-mandatory [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: 'none' }}
      >
        {MOCK_ARTICLES.map((article) => (
          <div key={article.cid} className="relative h-full w-full shrink-0 snap-start">
            <Image
              src={article.coverImageUrl}
              alt=""
              fill
              sizes="430px"
              className="object-cover"
              priority={false}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/40" />

            <div className="absolute top-4 left-4 right-4 flex items-start justify-between gap-2">
              <span className="rounded-full bg-white/20 backdrop-blur px-2.5 py-1 text-xs font-medium text-white">
                {article.category}
              </span>
              <VerificationBadge
                status={article.verification.status}
                verifierCount={article.verification.verifierCount}
                className="!bg-white/20 !text-white backdrop-blur [&_svg]:opacity-90"
              />
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
              <h2 className="text-xl font-bold leading-tight">{article.title}</h2>
              <p className="mt-2 text-sm text-white/80 line-clamp-2">{article.excerpt}</p>
              <div className="mt-3 flex items-center gap-3 text-xs text-white/70">
                <span>{article.authorName}</span>
                <span className="inline-flex items-center gap-0.5">
                  <Clock className="h-3 w-3" />
                  {article.readingTime}m read
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <p className="bg-black py-2 text-center text-[11px] text-white/40">scroll to see the next story</p>
    </div>
  )
}
