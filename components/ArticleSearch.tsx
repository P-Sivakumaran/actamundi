'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { useCallback, useTransition, useMemo } from 'react'
import { useDebounce } from '@/hooks/use-debounce'
import { Combobox, ComboboxOption } from '@/components/ui/combobox'

interface ArticleSearchProps {
  categories: string[]
}

export default function ArticleSearch({ categories }: ArticleSearchProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  // Convert categories array to the format expected by Combobox
  const categoryOptions = useMemo<ComboboxOption[]>(() => [
    { value: '', label: 'All Categories' },
    ...categories.map(category => ({ 
      value: category, 
      label: category 
    }))
  ], [categories])

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(name, value)
      } else {
        params.delete(name)
      }
      return params.toString()
    },
    [searchParams]
  )

  const debouncedSearch = useDebounce((value: string) => {
    startTransition(() => {
      router.push(`/articles?${createQueryString('q', value)}`)
    })
  }, 300)

  const handleCategoryChange = (value: string) => {
    startTransition(() => {
      router.push(`/articles?${createQueryString('category', value)}`)
    })
  }

  return (
    <div className="space-y-4">
      <div>
        <Input
          type="search"
          placeholder="Search articles..."
          defaultValue={searchParams.get('q') ?? ''}
          onChange={(e) => debouncedSearch(e.target.value)}
          className="w-full"
        />
      </div>

      <div>
        <Combobox
          options={categoryOptions}
          value={searchParams.get('category') ?? ''}
          onValueChange={handleCategoryChange}
          placeholder="Select category"
          emptyMessage="No categories found."
        />
      </div>

      {isPending && (
        <div className="text-sm text-muted-foreground">
          Updating results...
        </div>
      )}
    </div>
  )
} 