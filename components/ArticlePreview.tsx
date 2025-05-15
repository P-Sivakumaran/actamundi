'use client'

import Image from 'next/image'
import { Article } from '@/models/Article'
import { formatDate } from '@/lib/utils'

interface ArticlePreviewProps {
  article: Article
}

export default function ArticlePreview({ article }: ArticlePreviewProps) {
  return (
    <article className="prose prose-lg mx-auto max-w-4xl px-4 py-8">
      {article.coverImage && (
        <div className="relative aspect-video w-full overflow-hidden rounded-lg mb-8">
          <Image
            src={article.coverImage}
            alt={article.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}
      
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-4">{article.title}</h1>
        <div className="flex items-center gap-4 text-muted-foreground">
          {article.publishedAt && (
            <time dateTime={article.publishedAt}>
              {formatDate(article.publishedAt)}
            </time>
          )}
          {article.category && (
            <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
              {article.category}
            </span>
          )}
        </div>
      </header>

      <div className="prose prose-lg max-w-none">
        <div dangerouslySetInnerHTML={{ __html: article.content }} />
      </div>

      {article.tags && article.tags.length > 0 && (
        <footer className="mt-8 pt-8 border-t">
          <div className="flex flex-wrap gap-2">
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        </footer>
      )}
    </article>
  )
} 