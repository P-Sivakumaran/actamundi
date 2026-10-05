import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'

export function Default() {
  return (
    <Dialog defaultOpen>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Publish this dispatch?</DialogTitle>
          <DialogDescription>
            Your signature will be attached and the article announced to the network.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}
