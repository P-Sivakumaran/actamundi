import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export function Default() {
  return (
    <Card className="w-[380px]">
      <CardHeader>
        <CardTitle>Protocol live</CardTitle>
        <CardDescription>12 peers · 24 published today</CardDescription>
      </CardHeader>
    </Card>
  )
}
