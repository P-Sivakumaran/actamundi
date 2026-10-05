import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function Default() {
  return (
    <Tabs defaultValue="dispatch" className="w-[420px]">
      <TabsList>
        <TabsTrigger value="dispatch">Dispatch</TabsTrigger>
        <TabsTrigger value="verified">Verified</TabsTrigger>
        <TabsTrigger value="drafts">Drafts</TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
