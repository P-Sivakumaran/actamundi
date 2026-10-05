import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export function Default() {
  return (
    <Dialog defaultOpen>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Publish this dispatch?</DialogTitle>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}
