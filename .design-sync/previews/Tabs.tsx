import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

export function Default() {
  return (
    <Tabs defaultValue="dispatch" className="w-[420px]">
      <TabsList>
        <TabsTrigger value="dispatch">Dispatch</TabsTrigger>
        <TabsTrigger value="verified">Verified</TabsTrigger>
        <TabsTrigger value="drafts">Drafts</TabsTrigger>
      </TabsList>
      <TabsContent value="dispatch">
        <p className="text-sm text-muted-foreground mt-4">
          Latest signed articles from the network.
        </p>
      </TabsContent>
      <TabsContent value="verified">
        <p className="text-sm text-muted-foreground mt-4">
          Dispatches with a quorum of independent signatures.
        </p>
      </TabsContent>
      <TabsContent value="drafts">
        <p className="text-sm text-muted-foreground mt-4">
          Unpublished work saved to your local author key.
        </p>
      </TabsContent>
    </Tabs>
  )
}

export function Moderation() {
  return (
    <Tabs defaultValue="flagged" className="w-[420px]">
      <TabsList>
        <TabsTrigger value="flagged">Flagged</TabsTrigger>
        <TabsTrigger value="endorsed">Endorsed</TabsTrigger>
        <TabsTrigger value="delisted">Delisted</TabsTrigger>
      </TabsList>
      <TabsContent value="flagged">
        <p className="text-sm text-muted-foreground mt-4">
          3 dispatches awaiting a second independent reviewer.
        </p>
      </TabsContent>
      <TabsContent value="endorsed">
        <p className="text-sm text-muted-foreground mt-4">
          Endorsed by at least three verified wallets.
        </p>
      </TabsContent>
      <TabsContent value="delisted">
        <p className="text-sm text-muted-foreground mt-4">
          Removed from the public feed after a falsehood finding.
        </p>
      </TabsContent>
    </Tabs>
  )
}
