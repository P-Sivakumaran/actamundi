import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'

export function Open() {
  return (
    <Select open defaultValue="published">
      <SelectTrigger className="w-[220px]">
        <SelectValue placeholder="Filter by status" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="draft">Draft</SelectItem>
        <SelectItem value="published">Published</SelectItem>
        <SelectItem value="endorsed">Endorsed</SelectItem>
        <SelectItem value="flagged" disabled>
          Flagged
        </SelectItem>
      </SelectContent>
    </Select>
  )
}
