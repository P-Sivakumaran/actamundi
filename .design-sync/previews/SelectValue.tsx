import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'

export function Default() {
  return (
    <Select defaultValue="endorsed">
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
