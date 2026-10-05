import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectGroup, SelectLabel } from '@/components/ui/select'

export function Default() {
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
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
