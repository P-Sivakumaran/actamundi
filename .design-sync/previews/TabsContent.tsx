import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

export function Default() {
  return (
    <Tabs defaultValue="dispatch" className="w-[420px]">
      <TabsList>
        <TabsTrigger value="dispatch">Dispatch</TabsTrigger>
      </TabsList>
      <TabsContent value="dispatch">
        <p className="text-sm text-muted-foreground mt-4">
          Latest signed articles from the network, ranked by endorsement
          weight from verified wallets.
        </p>
      </TabsContent>
    </Tabs>
  )
}
