import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

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
        <DialogFooter>
          <Button variant="outline">Cancel</Button>
          <Button>Publish</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function WithLongBody() {
  return (
    <Dialog defaultOpen>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dispute this correction</DialogTitle>
          <DialogDescription>
            Three independent reviewers flagged this dispatch for a factual inaccuracy in paragraph two.
            Filing a dispute will notify the original author and pause syndication until consensus is
            reached by at least five distinct reviewers.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline">Dismiss</Button>
          <Button variant="destructive">File dispute</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
