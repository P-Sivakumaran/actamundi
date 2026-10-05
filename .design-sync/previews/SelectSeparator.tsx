import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectGroup, SelectLabel, SelectSeparator } from '@/components/ui/select'

export function Default() {
  return (
    <Select open defaultValue="world">
      <SelectTrigger className="w-[220px]">
        <SelectValue placeholder="Select a section" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Sections</SelectLabel>
          <SelectItem value="world">World</SelectItem>
          <SelectItem value="culture">Culture</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>Status</SelectLabel>
          <SelectItem value="draft">Draft</SelectItem>
          <SelectItem value="published">Published</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
