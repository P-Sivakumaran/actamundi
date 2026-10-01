'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { P2PArticle } from '@/models/P2PArticle'
import { coverImageUrl } from '@/lib/p2p/articles'
import { cn } from '@/lib/utils'
import { CalendarIcon, Clock, TagIcon, ArrowRightIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface ArticleCardProps {
  article: P2PArticle
  className?: string
  priority?: boolean
}

export function ArticleCard({ article, className, priority = false }: ArticleCardProps) {
  const formattedDate = new Date(article.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
  const coverImage = coverImageUrl(article.coverImageCid)

  return (
    <div
      className={cn(
        "cq-card-container group animate-fade-in",
        className
      )}
    >
      <Link
        href={`/articles/${article.cid}`}
        aria-label={`Read article: ${article.title}`}
        className={cn(
          "block h-full overflow-hidden bg-card hover:bg-card/95 dark:hover:bg-card/90 text-card-foreground",
          "rounded-xl shadow-md hover:shadow-lg transition-all",
          "border border-border/50 hover:border-border",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "cq-card-horizontal"
        )}
      >
        {coverImage && (
          <div className="relative w-full h-52 @md:h-full @md:w-2/5 overflow-hidden">
            <Image
              src={coverImage}
              alt={article.title}
              fill
              priority={priority}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </div>
        )}
        
        <div className={cn(
          "p-5 @md:p-6 @lg:p-8 flex flex-col h-full",
          coverImage ? "@md:w-3/5" : "w-full"
        )}>
          <div className="flex items-center text-xs text-muted-foreground mb-3 gap-4">
            <div className="flex items-center gap-1.5">
              <CalendarIcon className="h-3.5 w-3.5" />
              <time dateTime={new Date(article.createdAt).toISOString()}>{formattedDate}</time>
            </div>
            
            {article.category && (
              <Badge variant="outline" className="text-xs font-normal">
                {article.category}
              </Badge>
            )}
            
            {article.readingTime && (
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                <span>{article.readingTime} min read</span>
              </div>
            )}
          </div>
          
          <h2 className="text-xl @md:text-2xl @lg:text-3xl font-serif font-semibold text-foreground group-hover:text-primary transition-colors mb-3 line-clamp-2">
            {article.title}
          </h2>
          
          <p className="mt-2 text-gray-600 dark:text-gray-300 line-clamp-3 @lg:line-clamp-4 flex-grow text-sm @md:text-base">
            {article.excerpt}
          </p>
          
          {article.tags && article.tags.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {article.tags.slice(0, 3).map(tag => (
                <Badge key={tag} variant="secondary" className="px-2 py-0.5 text-xs font-normal">
                  {tag}
                </Badge>
              ))}
              {article.tags.length > 3 && (
                <Badge variant="secondary" className="px-2 py-0.5 text-xs font-normal">
                  +{article.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
          
          <div className="mt-5 @md:mt-auto pt-4 flex items-center justify-between border-t border-border/50">
            <span className="text-sm font-medium text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
              Read more <ArrowRightIcon className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </span>
            
            <div className="flex items-center gap-3">
              <span className={cn(
                "text-xs px-2 py-1 rounded-full font-medium",
                article.status === 'published' 
                  ? "bg-success/15 text-success" 
                  : "bg-warning/15 text-warning"
              )}>
                {article.status === 'published' ? 'Published' : 'Draft'}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  )
} 