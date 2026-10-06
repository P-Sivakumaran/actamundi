import { PageFanLoader } from '@/components/motion/PageFanLoader'

export default function Loading() {
  return (
    <div className="grid min-h-[50vh] place-items-center">
      <PageFanLoader label="Fetching from peers…" />
    </div>
  )
}
