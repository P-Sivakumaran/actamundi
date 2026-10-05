import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function Default() {
  return (
    <Tabs defaultValue="verified" className="w-[420px]">
      <TabsList>
        <TabsTrigger value="dispatch">Dispatch</TabsTrigger>
        <TabsTrigger value="verified">Verified</TabsTrigger>
        <TabsTrigger value="drafts" disabled>
          Drafts
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
