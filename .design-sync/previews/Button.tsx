import { Button } from '@/components/ui/button'

export function Variants() {
  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="default">Publish</Button>
      <Button variant="destructive">Delete draft</Button>
      <Button variant="outline">Cancel</Button>
      <Button variant="secondary">Save draft</Button>
      <Button variant="ghost">Dismiss</Button>
      <Button variant="link">Read more</Button>
      <Button variant="success">Endorse</Button>
      <Button variant="info">Details</Button>
      <Button variant="warning">Flag</Button>
    </div>
  )
}

export function Sizes() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button size="xs">Extra small</Button>
      <Button size="sm">Small</Button>
      <Button size="default">Default</Button>
      <Button size="lg">Large</Button>
      <Button size="xl">Extra large</Button>
    </div>
  )
}

export function States() {
  return (
    <div className="flex flex-wrap gap-2">
      <Button disabled>Disabled</Button>
      <Button fullWidth className="max-w-[220px]">Full width</Button>
      <Button rounded>Rounded</Button>
    </div>
  )
}

export function Special() {
  return (
    <div className="flex flex-wrap gap-2 bg-[#13201f] p-4 rounded-lg">
      <Button variant="premium">Go premium</Button>
      <Button variant="bordered">Bordered</Button>
      <Button variant="glass">Glass</Button>
    </div>
  )
}
