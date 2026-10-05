import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export function Closed() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Connect your wallet</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Connect your wallet</DialogTitle>
          <DialogDescription>
            Sign in with your wallet to publish, moderate, or tip authors on the network.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline">Cancel</Button>
          <Button>Connect</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
