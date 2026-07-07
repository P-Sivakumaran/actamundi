'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Article } from '@/models/Article'
import { cn } from '@/lib/utils'
import { CalendarIcon, Clock, TagIcon, ArrowRightIcon, EyeIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { CategoryTag } from '@/components/CategoryTag'

// Define variants for the card
export type ArticleCardVariant = 'default' | 'horizontal' | 'compact' | 'featured'
export type ArticleCardSize = 'sm' | 'md' | 'lg'

export interface ArticleCardProps {
  article: Article
  variant?: ArticleCardVariant
  size?: ArticleCardSize
  className?: string
  priority?: boolean
  showCategory?: boolean
  showTags?: boolean
  showStatus?: boolean
  showViews?: boolean
  showReadingTime?: boolean
  maxTags?: number
  linkHref?: string
  onCardClick?: (article: Article) => void
  textAlign?: 'left' | 'center' | 'right'
}

export function ArticleCard({ 
  article, 
  variant = 'default',
  size = 'md',
  className, 
  priority = false,
  showCategory = true,
  showTags = true,
  showStatus = true,
  showViews = true,
  showReadingTime = true,
  maxTags = 3,
  linkHref,
  onCardClick,
  textAlign = 'left'
}: ArticleCardProps) {
  const formattedDate = new Date(article.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })

  // Determine the href
  const href = linkHref || `/articles/${article.slug}`

  // Handle click events
  const handleClick = (e: React.MouseEvent) => {
    if (onCardClick) {
      e.preventDefault()
      onCardClick(article)
    }
  }

  // Card size styles
  const sizeStyles = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
  }[size]

  // Card variant styles
  const variantStyles = {
    default: "",
    horizontal: "cq-card-horizontal",
    compact: "p-3",
    featured: "border-primary/50 shadow-lg"
  }[variant]

  // Text alignment styles
  const alignmentStyles = {
    left: "text-left",
    center: "text-center",
    right: "text-right"
  }[textAlign]

  // Image sizes based on variant and screen size
  const imageSizes = 
    variant === 'horizontal' 
      ? "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      : "(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
  
  // Image height based on variant
  const imageHeight = 
    variant === 'compact' ? 'h-40' : 
    variant === 'horizontal' ? 'h-52 @md:h-full @md:w-2/5' : 
    'h-52'

  return (
    <div 
      className={cn(
        "cq-card-container group animate-fade-in", 
        sizeStyles,
        className
      )}
    >
      <Link 
        href={href}
        aria-label={`Read article: ${article.title}`}
        onClick={handleClick}
        className={cn(
          "block h-full overflow-hidden bg-card hover:bg-card/95 dark:hover:bg-card/90 text-card-foreground",
          "rounded-xl shadow-md hover:shadow-lg transition-all",
          "border border-border/50 hover:border-border",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          variantStyles
        )}
      >
        {article.coverImage && (
          <div className={cn("relative w-full overflow-hidden", imageHeight)}>
            <Image
              src={article.coverImage}
              alt={article.title}
              fill
              priority={priority}
              sizes={imageSizes}
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {article.featured && (
              <div className="absolute top-2 left-2 z-10">
                <Badge variant="secondary" className="bg-secondary/80 backdrop-blur-sm">
                  Featured
                </Badge>
              </div>
            )}
          </div>
        )}
        
        <div className={cn(
          "p-fluid-4 flex flex-col h-full rhythm-tight",
          variant === 'compact' ? "p-fluid-2" : "",
          (variant === 'horizontal' && article.coverImage) ? "@md:w-3/5" : "w-full",
          alignmentStyles
        )}>
          <div className={cn(
            "flex flex-wrap items-center text-fluid-xs text-muted-foreground gap-4 mb-3",
            textAlign === 'center' && "justify-center",
            textAlign === 'right' && "justify-end"
          )}>
            <div className="flex items-center gap-1.5">
              <CalendarIcon className="h-3.5 w-3.5 text-gray-700 dark:text-gray-300" />
              <time dateTime={new Date(article.createdAt).toISOString()} className="text-gray-700 dark:text-gray-300">{formattedDate}</time>
            </div>
            
            {showCategory && article.category && (
              <CategoryTag 
                category={article.category} 
                size="sm" 
                variant="outline"
              />
            )}
            
            {showReadingTime && article.readingTime && (
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-gray-700 dark:text-gray-300" />
                <span className="text-gray-700 dark:text-gray-300">{article.readingTime} min read</span>
              </div>
            )}
          </div>
          
          <h2 className={cn(
            "font-serif font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug space-fluid-2",
            {
              'text-fluid-lg': variant === 'compact' || size === 'sm',
              'text-fluid-xl': size === 'md' && variant !== 'compact',
              'text-fluid-2xl': size === 'lg'
            }
          )}>
            {article.title}
          </h2>
          
          {article.excerpt && (
            <p className={cn(
              "text-gray-700 dark:text-gray-300 flex-grow leading-normal space-fluid-3",
              {
                'text-fluid-xs line-clamp-2': variant === 'compact',
                'text-fluid-sm line-clamp-3': variant !== 'compact' && size !== 'lg',
                'text-fluid-base line-clamp-4': size === 'lg'
              }
            )}>
              {article.excerpt}
            </p>
          )}
          
          {showTags && article.tags && article.tags.length > 0 && (
            <div className={cn(
              "flex flex-wrap gap-2 space-fluid-3",
              textAlign === 'center' && "justify-center",
              textAlign === 'right' && "justify-end"
            )}>
              {article.tags.slice(0, maxTags).map(tag => (
                <Badge key={tag} variant="secondary" className="px-2 py-0.5 text-fluid-xs font-normal min-w-[60px] text-center">
                  {tag}
                </Badge>
              ))}
              {article.tags.length > maxTags && (
                <Badge variant="secondary" className="px-2 py-0.5 text-fluid-xs font-normal min-w-[60px] text-center">
                  +{article.tags.length - maxTags}
                </Badge>
              )}
            </div>
          )}
          
          <div className={cn(
            "pt-4 flex items-center justify-between border-t border-border/50",
            variant === 'compact' ? "pt-3" : ""
          )}>
            <span className="text-fluid-sm font-medium text-primary-700 dark:text-primary-300 flex items-center gap-1 group-hover:gap-2 transition-all">
              Read more <ArrowRightIcon className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </span>
            
            <div className="flex items-center gap-3">
              {showViews && article.views && (
                <span className="flex items-center text-fluid-xs text-gray-700 dark:text-gray-300 gap-1">
                  <EyeIcon className="h-3.5 w-3.5" /> {article.views}
                </span>
              )}
              
              {showStatus && (
                <span className={cn(
                  "text-fluid-xs px-2 py-1 rounded-full font-medium",
                  article.status === 'published' 
                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" 
                    : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                )}>
                  {article.status === 'published' ? 'Published' : 'Draft'}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </div>
  )
} 