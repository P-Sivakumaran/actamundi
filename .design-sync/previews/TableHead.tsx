import { Table, TableHeader, TableRow, TableHead } from '@/components/ui/table'

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
    </Table>
  )
}
