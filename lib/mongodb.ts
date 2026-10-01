import { MongoClient, Db } from 'mongodb'

const options = {
  maxPoolSize: 10,
  minPoolSize: 5,
  maxIdleTimeMS: 30000,
  connectTimeoutMS: 10000,
}

// Connection is created lazily, on first connectToDatabase() call, rather
// than at module import — importing this module (e.g. transitively, from a
// route that doesn't end up querying anything) must not require
// MONGODB_URI to be set, or `next build`'s page-data collection step
// crashes for every route that imports it, configured or not.
let clientPromise: Promise<MongoClient> | undefined

function getClientPromise(): Promise<MongoClient> {
  if (clientPromise) return clientPromise

  if (!process.env.MONGODB_URI) {
    throw new DatabaseError('Please add your Mongo URI to .env.local')
  }
  const uri = process.env.MONGODB_URI

  if (process.env.NODE_ENV === 'development') {
    // In development mode, use a global variable so that the value
    // is preserved across module reloads caused by HMR (Hot Module Replacement).
    const globalWithMongo = global as typeof globalThis & {
      _mongoClientPromise?: Promise<MongoClient>
    }
    globalWithMongo._mongoClientPromise ??= new MongoClient(uri, options).connect()
    clientPromise = globalWithMongo._mongoClientPromise
  } else {
    // In production mode, it's best to not use a global variable.
    clientPromise = new MongoClient(uri, options).connect()
  }

  return clientPromise
}

export class DatabaseError extends Error {
  constructor(message: string, public code?: string) {
    super(message)
    this.name = 'DatabaseError'
  }
}

export async function connectToDatabase(): Promise<{ db: Db; client: MongoClient }> {
  try {
    const client = await getClientPromise()
    const db = client.db(process.env.MONGODB_DB)
    return { db, client }
  } catch (error) {
    if (error instanceof DatabaseError) throw error
    throw new DatabaseError(
      'Failed to connect to database',
      error instanceof Error ? error.message : 'unknown'
    )
  }
}

export async function withTransaction<T>(
  operation: (db: Db) => Promise<T>
): Promise<T> {
  const { db, client } = await connectToDatabase()
  const session = client.startSession()
  
  try {
    let result: T
    await session.withTransaction(async () => {
      result = await operation(db)
    })
    return result!
  } catch (error) {
    throw new DatabaseError(
      'Transaction failed',
      error instanceof Error ? error.message : 'unknown'
    )
  } finally {
    await session.endSession()
  }
} 