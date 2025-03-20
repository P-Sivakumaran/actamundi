'use client'

import React, { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'

interface ArticleSearchProps {
  onSearch: (filters: ArticleFilters) => void
  categories: string[]
}

export interface ArticleFilters {
  search: string
  category: string
  status: string
  dateFrom: Date | null
  dateTo: Date | null
}

export default function ArticleSearch() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('q') || '')
  const [category, setCategory] = useState(searchParams.get('category') || '')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (search) params.set('q', search)
    if (category) params.set('category', category)
    router.push(`/articles?${params.toString()}`)
  }

  return (
    <form onSubmit={handleSearch} className="space-y-4">
      <div>
        <label htmlFor="search" className="sr-only">
          Search articles
        </label>
        <input
          type="text"
          id="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search articles..."
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="category" className="sr-only">
          Filter by category
        </label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
        >
          <option value="">All Categories</option>
          <option value="technology">Technology</option>
          <option value="science">Science</option>
          <option value="business">Business</option>
          <option value="health">Health</option>
          <option value="lifestyle">Lifestyle</option>
        </select>
      </div>

      <button
        type="submit"
        className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
      >
        Search
      </button>
    </form>
  )
} 