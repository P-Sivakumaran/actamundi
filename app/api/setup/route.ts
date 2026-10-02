import { timingSafeEqual } from 'crypto'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { connectToDatabase } from '@/lib/mongodb'

function tokenMatches(provided: string, expected: string): boolean {
  const a = Buffer.from(provided)
  const b = Buffer.from(expected)
  // Buffers must be equal length for timingSafeEqual; a length mismatch is
  // itself not a secret worth protecting, so comparing against a zeroed
  // buffer of the provided length is fine here.
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

export async function POST(request: Request) {
  try {
    // Setup is opt-in per deployment: without SETUP_TOKEN configured, the
    // first unauthenticated caller could otherwise become admin.
    const setupToken = process.env.SETUP_TOKEN
    if (!setupToken) {
      return NextResponse.json(
        { error: 'Setup is disabled' },
        { status: 503 }
      )
    }

    const { email, password, name, token } = await request.json()

    if (
      typeof email !== 'string' || typeof password !== 'string' ||
      typeof name !== 'string' || typeof token !== 'string' ||
      !email || !password || !name || !token
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (!tokenMatches(token, setupToken)) {
      return NextResponse.json(
        { error: 'Invalid setup token' },
        { status: 401 }
      )
    }

    const { db, client } = await connectToDatabase()
    const hashedPassword = await bcrypt.hash(password, 12)
    const now = new Date()

    // The old countDocuments()-then-insert check raced: two concurrent
    // requests could both observe zero users and both insert an admin.
    // App-level locking (a sentinel doc, deleted/reclaimed by timestamp)
    // can't close this without a fencing token, because "the lock is old"
    // doesn't prove its owner is dead — a merely slow request can resume
    // and write after being "reclaimed". Real mutual exclusion needs the
    // database's own write-conflict detection, so the completion check and
    // the admin insert run in one transaction: a one-time sentinel
    // (_id: 'setup') is upserted first, and MongoDB serializes concurrent
    // writes to that same document, so only one transaction's upsert can
    // ever win. Any failure after that point — including a crash — aborts
    // the whole transaction, sentinel included, so there's no orphaned
    // lock to recover from; the next request just starts clean.
    //
    // Assumes a replica-set deployment (e.g. Atlas, always at minimum a
    // single-node replica set) — standalone mongod doesn't support
    // transactions and session.withTransaction() will throw.
    const session = client.startSession()
    try {
      let userId: unknown
      await session.withTransaction(async () => {
        try {
          await db.collection<{ _id: string; completedAt: Date }>('setup_lock').insertOne(
            { _id: 'setup', completedAt: now },
            { session }
          )
        } catch (lockError: unknown) {
          if ((lockError as { code?: number }).code === 11000) {
            throw Object.assign(new Error('Setup has already been completed'), { status: 400 })
          }
          throw lockError
        }

        // Installations from before this sentinel existed (the old
        // countDocuments() guard, or scripts/init-db.ts) may already have
        // an admin with no setup_lock doc — don't create a second one.
        const existingUsers = await db.collection('users').countDocuments({}, { session })
        if (existingUsers > 0) {
          throw Object.assign(new Error('Setup has already been completed'), { status: 400 })
        }

        const result = await db.collection('users').insertOne({
          email,
          password: hashedPassword,
          name,
          role: 'admin',
          createdAt: now,
          updatedAt: now
        }, { session })
        userId = result.insertedId
      })

      return NextResponse.json({
        message: 'Admin user created successfully',
        userId
      })
    } catch (txError: unknown) {
      const status = (txError as { status?: number }).status
      if (status) {
        return NextResponse.json(
          { error: (txError as Error).message },
          { status }
        )
      }
      throw txError
    } finally {
      await session.endSession()
    }
  } catch (error) {
    console.error('Setup error:', error)
    return NextResponse.json(
      { error: 'Failed to create admin user' },
      { status: 500 }
    )
  }
}