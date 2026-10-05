import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export function Default() {
  return (
    <Dialog defaultOpen>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Signature required</DialogTitle>
          <DialogDescription>
            Sign this dispatch with your wallet to confirm authorship before it goes live.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Not now</Button>
          </DialogClose>
          <Button>Sign and publish</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
