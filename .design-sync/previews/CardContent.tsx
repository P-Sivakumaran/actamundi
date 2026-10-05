import { Card, CardContent } from '@/components/ui/card'

export function Default() {
  return (
    <Card className="w-[380px]">
      <CardContent className="pt-6">
        <p className="text-sm">
          Each version receives a content address. Each author signs their work.
        </p>
      </CardContent>
    </Card>
  )
}
