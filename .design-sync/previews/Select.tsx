import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
} from '@/components/ui/select'

export function Closed() {
  return (
    <Select defaultValue="world">
      <SelectTrigger className="w-[220px]">
        <SelectValue placeholder="Select a section" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="world">World</SelectItem>
        <SelectItem value="culture">Culture</SelectItem>
        <SelectItem value="ideas">Ideas</SelectItem>
      </SelectContent>
    </Select>
  )
}

export function Open() {
  return (
    <Select open defaultValue="culture">
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

export function Placeholder() {
  return (
    <Select>
      <SelectTrigger className="w-[220px]">
        <SelectValue placeholder="Filter by status" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="draft">Draft</SelectItem>
        <SelectItem value="published">Published</SelectItem>
      </SelectContent>
    </Select>
  )
}

export function Disabled() {
  return (
    <Select disabled defaultValue="endorsed">
      <SelectTrigger className="w-[220px]">
        <SelectValue placeholder="Moderation status" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="endorsed">Endorsed</SelectItem>
        <SelectItem value="flagged">Flagged</SelectItem>
      </SelectContent>
    </Select>
  )
}
