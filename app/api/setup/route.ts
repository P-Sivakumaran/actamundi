import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { connectToDatabase } from '@/lib/mongodb'

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json()

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()
    
    // Check if any user exists
    const userCount = await db.collection('users').countDocuments()
    if (userCount > 0) {
      return NextResponse.json(
        { error: 'Setup has already been completed' },
        { status: 400 }
      )
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash(password, 12)
    const now = new Date()

    const result = await db.collection('users').insertOne({
      email,
      password: hashedPassword,
      name,
      role: 'admin',
      createdAt: now,
      updatedAt: now
    })

    return NextResponse.json({
      message: 'Admin user created successfully',
      userId: result.insertedId
    })
  } catch (error) {
    console.error('Setup error:', error)
    return NextResponse.json(
      { error: 'Failed to create admin user' },
      { status: 500 }
    )
  }
} 