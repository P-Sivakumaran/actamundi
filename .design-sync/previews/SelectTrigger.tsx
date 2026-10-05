import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'

export function Default() {
  return (
    <Select defaultValue="world">
      <SelectTrigger className="w-[220px]">
        <SelectValue placeholder="Select a section" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="world">World</SelectItem>
        <SelectItem value="culture">Culture</SelectItem>
      </SelectContent>
    </Select>
  )
}

export function Placeholder() {
  return (
    <Select>
      <SelectTrigger className="w-[220px]">
        <SelectValue placeholder="Filter by status" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="draft">Draft</SelectItem>
      </SelectContent>
    </Select>
  )
}
