# ArticleFeedCard.tsx — delisted cards tilt back and dim

```diff
-import { ModerationBadge } from '@/components/ModerationBadge'
+import { ModerationBadge, moderationStatus } from '@/components/ModerationBadge'
+import { cn } from '@/lib/utils'
 ...
-  const className = 'relative block h-full w-full shrink-0 snap-start overflow-hidden'
+  const delisted = moderationStatus(moderation) === 'delisted'
+  const className = cn(
+    'relative block h-full w-full shrink-0 snap-start overflow-hidden',
+    delisted ? 'am-delisted' : 'am-listed'
+  )
```

Feeds filter delisted CIDs out, so in practice this shows on (a) direct-CID detail
pages and (b) the moment a live `subscribeToModeration` update delists a card that is
on screen — it sinks back before the feed removes it. To let the motion land, delay
removal from the feed list by ~600ms after the status flips to `delisted`.
