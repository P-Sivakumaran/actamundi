import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export function Closed() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Publish dispatch</Button>
      </DialogTrigger>
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

export function Open() {
  return (
    <Dialog defaultOpen>
      <DialogTrigger asChild>
        <Button variant="outline">Delist article</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delist this article?</DialogTitle>
          <DialogDescription>
            Readers will no longer see this dispatch in their feed. This action is recorded on the moderation log.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline">Cancel</Button>
          <Button variant="destructive">Delist</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
