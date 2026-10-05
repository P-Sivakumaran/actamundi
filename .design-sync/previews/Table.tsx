import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
  TableFooter,
} from '@/components/ui/table'

export function Default() {
  return (
    <Table>
      <TableCaption>Recent dispatches awaiting moderation review.</TableCaption>
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
        <TableRow>
          <TableCell>Transit budget shortfall</TableCell>
          <TableCell>0x4A9D…2E71</TableCell>
          <TableCell>Delisted</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  )
}

export function WithFooter() {
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
