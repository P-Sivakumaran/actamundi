import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { Article } from '@/models/Article'

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const client = await clientPromise
    const db = client.db('actamundi')
    const article = await db.collection('articles').findOne({ 
      slug: params.slug,
      status: 'published'
    })

    if (!article) {
      return new NextResponse('Article not found', { status: 404 })
    }

    return NextResponse.json(article as Article)
  } catch (error) {
    console.error('Error fetching article:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const client = await clientPromise
    const db = client.db('actamundi')
    const body = await request.json()
    
    const article = await db.collection('articles').findOne({ slug: params.slug })
    if (!article) {
      return new NextResponse('Article not found', { status: 404 })
    }

    const updatedArticle = {
      ...article,
      ...body,
      updatedAt: new Date().toISOString(),
    }

    if (body.status === 'published' && article.status !== 'published') {
      updatedArticle.publishedAt = new Date().toISOString()
    }

    await db.collection('articles').updateOne(
      { slug: params.slug },
      { $set: updatedArticle }
    )

    return NextResponse.json(updatedArticle as Article)
  } catch (error) {
    console.error('Error updating article:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 