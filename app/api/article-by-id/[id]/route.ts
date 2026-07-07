import { NextResponse } from 'next/server'
import { connectToDatabase, DatabaseError } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import { z } from 'zod'
import { Article } from '@/models/Article'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
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

const updateArticleSchema = z.object({
  title: z.string().trim().min(1, { message: "Title cannot be empty" }).optional(),
  content: z.string().trim().min(1, { message: "Content cannot be empty" }).optional(),
  excerpt: z.string().trim().optional(),
  category: z.string().trim().optional(),
  status: z.enum(['draft', 'published']).optional(),
  coverImage: z.string().url({ message: "Invalid URL for cover image" }).optional().or(z.literal('')),
  tags: z.array(z.string().trim()).optional(),
})

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    if (!ObjectId.isValid(params.id)) {
        return NextResponse.json({ error: 'Invalid article ID format' }, { status: 400 });
    }
    const articleId = new ObjectId(params.id);

    const rawArticleData = await request.json()
    
    const parsedArticleData = updateArticleSchema.parse(rawArticleData);

    if (Object.keys(parsedArticleData).length === 0) {
        return NextResponse.json({ error: 'No update data provided' }, { status: 400 });
    }

    const { db } = await connectToDatabase()

    const updates: Partial<Article> = { ...parsedArticleData };
    updates.updatedAt = new Date().toISOString();

    if (parsedArticleData.title) {
      updates.slug = parsedArticleData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      
      const conflictingArticle = await db.collection('articles').findOne({ slug: updates.slug, _id: { $ne: articleId } });
      if (conflictingArticle) {
        return NextResponse.json({ error: 'An article with this title already exists' }, { status: 409 });
      }
    }

    if (parsedArticleData.content) {
        updates.readingTime = Math.ceil(parsedArticleData.content.split(' ').length / 200);
    }

    if (parsedArticleData.status === 'published') {
      const currentArticle = await db.collection('articles').findOne({ _id: articleId }, { projection: { status: 1, publishedAt: 1 } });
      if (currentArticle?.status === 'draft') {
          updates.publishedAt = new Date().toISOString();
      }
    } else if (parsedArticleData.status === 'draft') {
      updates.publishedAt = undefined;
    }
    
    const result = await db
      .collection('articles')
      .findOneAndUpdate(
        { _id: articleId },
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
     if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.format() },
        { status: 400 }
      );
    }
    console.error('Database error or other internal error:', error)
    if (error instanceof DatabaseError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: 500 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to update article' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
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