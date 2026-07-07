import { ObjectId } from 'mongodb'

export interface Article {
  _id: string
  title: string
  content: string
  excerpt?: string
  coverImage?: string
  category?: string
  status: 'draft' | 'published'
  authorId?: string
  createdAt: string
  updatedAt: string
  publishedAt?: string
  tags?: string[]
  slug: string
  readingTime: number
  featured?: boolean
  views?: number
}

export interface Comment {
  _id: string
  content: string
  author: {
    _id: string
    name: string
    email: string
  }
  createdAt: Date
  status: 'pending' | 'approved' | 'rejected'
}

export interface User {
  _id: string
  name: string
  email: string
  password: string
  role: 'admin' | 'editor' | 'author'
  bio?: string
  image?: string
  createdAt: Date
  updatedAt: Date
} 