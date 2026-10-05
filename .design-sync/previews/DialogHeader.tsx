import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'

export function Default() {
  return (
    <Dialog defaultOpen>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Settle this dispute</DialogTitle>
          <DialogDescription>
            Review the evidence submitted by both the author and the challenger before casting your vote.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}
