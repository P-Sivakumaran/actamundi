import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export function Default() {
  return (
    <Card className="w-[380px]">
      <CardHeader>
        <CardTitle>Dispatch</CardTitle>
        <CardDescription>Independent reporting, signed at source.</CardDescription>
      </CardHeader>
    </Card>
  )
}
