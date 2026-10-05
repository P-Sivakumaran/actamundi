import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectGroup, SelectLabel } from '@/components/ui/select'

export function Open() {
  return (
    <Select open defaultValue="ideas">
      <SelectTrigger className="w-[220px]">
        <SelectValue placeholder="Select a section" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Sections</SelectLabel>
          <SelectItem value="world">World</SelectItem>
          <SelectItem value="culture">Culture</SelectItem>
          <SelectItem value="ideas">Ideas</SelectItem>
          <SelectItem value="politics">Politics</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
