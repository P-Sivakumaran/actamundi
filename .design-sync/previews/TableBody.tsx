import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'

export function Default() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Author</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>Waterfront rezoning</TableCell>
          <TableCell>0x71F2…93A8</TableCell>
          <TableCell>Endorsed</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Viral vaccine claim</TableCell>
          <TableCell>0x83C1…104E</TableCell>
          <TableCell>Flagged</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  )
}
