import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { db } = await connectToDatabase()
    const article = await db
      .collection('articles')
      .findOne({ _id: new ObjectId(params.id) })

    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(article)
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch article' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const article = await request.json()
    const { db } = await connectToDatabase()

    // Update timestamps and slug if title changed
    const updates = {
      ...article,
      updatedAt: new Date(),
      slug: article.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, ''),
      readingTime: Math.ceil(article.content.split(' ').length / 200)
    }

    const result = await db
      .collection('articles')
      .findOneAndUpdate(
        { _id: new ObjectId(params.id) },
        { $set: updates },
        { returnDocument: 'after' }
      )

    if (!result) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Failed to update article' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { db } = await connectToDatabase()
    const result = await db
      .collection('articles')
      .deleteOne({ _id: new ObjectId(params.id) })

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: 'Article deleted successfully' })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Failed to delete article' },
      { status: 500 }
    )
  }
} 