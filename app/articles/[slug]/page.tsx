import { notFound } from 'next/navigation'
import ArticlePreview from '@/components/ArticlePreview'
import { Article } from '@/models/Article'

async function getArticle(slug: string): Promise<Article> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/articles/${slug}`, {
    next: { revalidate: 3600 }, // Revalidate every hour
  })

  if (!res.ok) {
    throw new Error('Failed to fetch article')
  }

  return res.json()
}

export default async function ArticlePage({
  params,
}: {
  params: { slug: string }
}) {
  try {
    const article = await getArticle(params.slug)
    return <ArticlePreview article={article} />
  } catch (error) {
    notFound()
  }
} 