import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function Default() {
  return (
    <Card className="w-[380px]">
      <CardContent className="pt-6">
        <p className="text-sm">A corrections log preserved alongside the original dispatch.</p>
      </CardContent>
      <CardFooter>
        <Button size="sm" variant="outline">View history</Button>
      </CardFooter>
    </Card>
  )
}
