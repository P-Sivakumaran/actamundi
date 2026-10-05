import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function Default() {
  return (
    <Card className="w-[380px]">
      <CardHeader>
        <CardTitle>Waterfront rezoning</CardTitle>
        <CardDescription>Leaked planning documents show a fast-tracked approval.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          City council quietly rezoned the waterfront parcel for private development, bypassing the
          usual public comment period.
        </p>
      </CardContent>
      <CardFooter>
        <Button size="sm">Read article</Button>
      </CardFooter>
    </Card>
  )
}

export function HeaderOnly() {
  return (
    <Card className="w-[380px]">
      <CardHeader>
        <CardTitle>Signature verified</CardTitle>
        <CardDescription>Published by 0x71F2…93A8</CardDescription>
      </CardHeader>
    </Card>
  )
}

export function ContentOnly() {
  return (
    <Card className="w-[380px]">
      <CardContent className="pt-6">
        <p className="text-sm">A card with only a content region — no header or footer.</p>
      </CardContent>
    </Card>
  )
}
