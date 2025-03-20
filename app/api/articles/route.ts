import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { Article } from '@/models/Article'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const category = searchParams.get('category')
    const status = searchParams.get('status')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    const { db } = await connectToDatabase()
    
    // Build query
    const query: any = {}
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } }
      ]
    }
    
    if (category) {
      query.category = category
    }
    
    if (status) {
      query.status = status
    }
    
    if (dateFrom || dateTo) {
      query.createdAt = {}
      if (dateFrom) {
        query.createdAt.$gte = new Date(dateFrom)
      }
      if (dateTo) {
        query.createdAt.$lte = new Date(dateTo)
      }
    }

    // Get articles
    const articles = await db
      .collection('articles')
      .find(query)
      .sort({ createdAt: -1 })
      .toArray()

    // Get unique categories
    const categories = await db
      .collection('articles')
      .distinct('category')

    return NextResponse.json({
      articles,
      categories: categories.filter(Boolean)
    })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch articles' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const article = await request.json()
    const { db } = await connectToDatabase()

    // Create slug from title
    const slug = article.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    // Add timestamps and metadata
    const newArticle = {
      ...article,
      slug,
      createdAt: new Date(),
      updatedAt: new Date(),
      publishedAt: article.status === 'published' ? new Date() : null,
      readingTime: Math.ceil(article.content.split(' ').length / 200)
    }

    const result = await db
      .collection('articles')
      .insertOne(newArticle)

    return NextResponse.json({
      ...newArticle,
      _id: result.insertedId
    })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Failed to create article' },
      { status: 500 }
    )
  }
} 