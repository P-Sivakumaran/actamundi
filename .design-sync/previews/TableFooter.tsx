import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'

export function Default() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Dispatch</TableHead>
          <TableHead>Endorsements</TableHead>
          <TableHead>Disputes</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>Port authority contract leak</TableCell>
          <TableCell>18</TableCell>
          <TableCell>0</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>School board budget vote</TableCell>
          <TableCell>7</TableCell>
          <TableCell>2</TableCell>
        </TableRow>
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell>Total this week</TableCell>
          <TableCell>25</TableCell>
          <TableCell>2</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  )
}
