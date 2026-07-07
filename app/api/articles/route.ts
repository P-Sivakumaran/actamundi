import { NextResponse } from 'next/server'
import { connectToDatabase, DatabaseError } from '@/lib/mongodb'
import { Article } from '@/models/Article'
import { z } from 'zod'
import { ObjectId } from 'mongodb'
import {
  DEFAULT_ARTICLES_PER_PAGE,
  API_CACHE_DURATION_SECONDS
} from '@/config/appConfig' // Import from central config

// Helper functions for building query filters
function buildSearchFilter(search: string | null): object | null {
  if (!search) return null;
  // Using \b for word boundaries might yield better search results
  // Escape regex special characters properly for use within RegExp constructor
  const escapedSearch = search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'); 
  const searchRegex = new RegExp(escapedSearch, 'i'); // Pass escaped string and flags separately
  return {
    $or: [
      { title: { $regex: searchRegex } },
      { content: { $regex: searchRegex } },
      { excerpt: { $regex: searchRegex } }
    ]
  };
}

function buildCategoryFilter(category: string | null): object | null {
  if (!category) return null;
  return { category };
}

function buildStatusFilter(status: string | null): object | null {
  if (!status || (status !== 'draft' && status !== 'published')) return null;
  return { status };
}

function buildDateFilter(dateFrom: string | null, dateTo: string | null): object | null {
  if (!dateFrom && !dateTo) return null;
  const createdAt: any = {};
  if (dateFrom) {
    // Basic validation, consider more robust date parsing if needed
    const fromDate = new Date(dateFrom);
    if (!isNaN(fromDate.getTime())) createdAt.$gte = fromDate.toISOString();
  }
  if (dateTo) {
    const toDate = new Date(dateTo);
    if (!isNaN(toDate.getTime())) createdAt.$lte = toDate.toISOString();
  }
  return Object.keys(createdAt).length > 0 ? { createdAt } : null;
}

function buildCursorFilter(cursor: string | null): object | null {
  if (!cursor || !ObjectId.isValid(cursor)) return null;
  // Assuming cursor is the _id of the last item, paginate for older items
  return { _id: { $lt: new ObjectId(cursor) } };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const category = searchParams.get('category')
    const status = searchParams.get('status')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || String(DEFAULT_ARTICLES_PER_PAGE))
    const cursor = searchParams.get('cursor')

    const { db } = await connectToDatabase()
    
    // Build query using helper functions
    const queryParts = [
      buildSearchFilter(search),
      buildCategoryFilter(category),
      buildStatusFilter(status),
      buildDateFilter(dateFrom, dateTo),
      // Cursor filter should apply *after* other filters for count consistency
      // but before fetching the actual page data
    ];

    // Combine non-null query parts for counting total
    const countQuery = Object.assign({}, ...queryParts.filter(Boolean));

    // Add cursor for actual data fetching query
    const dataQueryParts = [...queryParts, buildCursorFilter(cursor)];
    const dataQuery = Object.assign({}, ...dataQueryParts.filter(Boolean));

    // Get total count for pagination (using query without cursor)
    const total = await db.collection('articles').countDocuments(countQuery)

    // Get articles with pagination (using query with cursor)
    const articles = await db
      .collection('articles')
      .find(dataQuery) // Use dataQuery with cursor here
      .sort({ createdAt: -1 }) // Consider making sort configurable too?
      .limit(limit + 1) // Get one extra to determine if there are more results
      .project({ // Keep projection
        title: 1,
        slug: 1,
        excerpt: 1,
        createdAt: 1,
        category: 1,
        status: 1,
        coverImage: 1,
        readingTime: 1,
      })
      .toArray()

    // Check if there are more results
    const hasMore = articles.length > limit
    if (hasMore) {
      articles.pop() // Remove the extra item
    }

    // Get unique categories
    const categories = await db
      .collection('articles')
      .distinct('category')

    // Prepare response with pagination metadata
    const response = {
      articles,
      categories: categories.filter(Boolean),
      pagination: {
        total,
        page,
        limit,
        hasMore,
        nextCursor: hasMore ? (articles[articles.length - 1]?._id.toString() ?? null) : null
      }
    }

    // Add cache headers using imported constant
    const headers = new Headers()
    headers.set('Cache-Control', `public, s-maxage=${API_CACHE_DURATION_SECONDS}, stale-while-revalidate=${API_CACHE_DURATION_SECONDS * 2}`)

    return NextResponse.json(response, { headers })
  } catch (error) {
    console.error('Database error:', error)
    if (error instanceof DatabaseError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: 500 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to fetch articles' },
      { status: 500 }
    )
  }
}

// Define Zod schema for article creation
const createArticleSchema = z.object({
  title: z.string().trim().min(1, { message: "Title is required" }),
  content: z.string().trim().min(1, { message: "Content is required" }),
  excerpt: z.string().trim().optional(),
  category: z.string().trim().optional(),
  status: z.enum(['draft', 'published']).default('draft'),
  coverImage: z.string().url({ message: "Invalid URL for cover image" }).optional().or(z.literal('')), // Allow empty string or valid URL
  tags: z.array(z.string().trim()).optional(),
  // Add other fields from your Article model as needed, e.g., authorId if it's part of the creation payload
});

export async function POST(request: Request) {
  try {
    const rawArticleData = await request.json()
    
    // Validate with Zod
    const parsedArticleData = createArticleSchema.parse(rawArticleData);

    const { db } = await connectToDatabase()

    // Validate required fields - Zod handles this now, but good to keep for general structure understanding
    // if (!parsedArticleData.title || !parsedArticleData.content) {
    //   return NextResponse.json(
    //     { error: 'Title and content are required' },
    //     { status: 400 }
    //   )
    // }

    // Create slug from title
    const slug = parsedArticleData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    // Check for duplicate slug
    const existingArticle = await db
      .collection('articles')
      .findOne({ slug })

    if (existingArticle) {
      return NextResponse.json(
        { error: 'An article with this title already exists' },
        { status: 409 }
      )
    }

    // Add timestamps and metadata
    const newArticle: Omit<Article, '_id'> = { // Use Omit to ensure all Article fields are considered minus _id
      ...parsedArticleData, // Spread validated data
      slug,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishedAt: parsedArticleData.status === 'published' ? new Date().toISOString() : undefined, // Use undefined for optional fields
      readingTime: Math.ceil(parsedArticleData.content.split(' ').length / 200),
      // Ensure all fields required by the Article model are present
      // For example, if authorId is required:
      // authorId: parsedArticleData.authorId || "default-author-id", // Get from parsed data or handle default/auth
    };

    const result = await db
      .collection('articles')
      .insertOne(newArticle)

    // Construct the full article object to return, including the generated _id
    const createdArticle: Article = {
      _id: result.insertedId.toString(),
      ...newArticle,
    };

    return NextResponse.json(createdArticle, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.format() },
        { status: 400 }
      );
    }
    console.error('Database error or other internal error:', error) // Log the actual error
    if (error instanceof DatabaseError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: 500 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to create article' },
      { status: 500 }
    )
  }
} 