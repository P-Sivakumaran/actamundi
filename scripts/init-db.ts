import { hash } from 'bcryptjs'
import clientPromise from '@/lib/mongodb'

async function initDb() {
  try {
    const client = await clientPromise
    const db = client.db('actamundi')

    // Create default admin user
    const adminPassword = await hash('admin123', 12)
    const adminUser = {
      name: 'Admin User',
      email: 'admin@actamundi.com',
      password: adminPassword,
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // Check if admin user already exists
    const existingAdmin = await db.collection('users').findOne({ email: adminUser.email })
    if (!existingAdmin) {
      await db.collection('users').insertOne(adminUser)
      console.log('Default admin user created successfully')
    } else {
      console.log('Admin user already exists')
    }

    // Create indexes
    await db.collection('users').createIndex({ email: 1 }, { unique: true })
    await db.collection('articles').createIndex({ slug: 1 }, { unique: true })
    await db.collection('articles').createIndex({ status: 1 })
    await db.collection('articles').createIndex({ publishedAt: -1 })

    console.log('Database initialized successfully')
  } catch (error) {
    console.error('Error initializing database:', error)
    process.exit(1)
  }
}

initDb() 