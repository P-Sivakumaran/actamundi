import { Node, mergeAttributes } from '@tiptap/core'

export interface VideoOptions {
  HTMLAttributes: Record<string, unknown>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    video: {
      setVideo: (options: { src: string; cid: string }) => ReturnType
    }
  }
}

/** No official @tiptap/extension-video exists (unlike extension-image) — this
 * mirrors that package's own structure. `src` is a resolved gateway URL,
 * baked in at insert time since article.content is saved as plain HTML and
 * rendered elsewhere via dangerouslySetInnerHTML, not re-hydrated through
 * Tiptap — there's no later point to re-resolve a CID against a different
 * gateway. `data-cid` is kept alongside purely for provenance/debugging. */
export const Video = Node.create<VideoOptions>({
  name: 'video',
  group: 'block',
  atom: true,
  draggable: true,

  addOptions() {
    return { HTMLAttributes: {} }
  },

  addAttributes() {
    return {
      src: { default: null },
      cid: { default: null },
    }
  },

  parseHTML() {
    return [{ tag: 'video[src]' }]
  },

  renderHTML({ HTMLAttributes }) {
    const { cid, ...rest } = HTMLAttributes
    return [
      'video',
      mergeAttributes(this.options.HTMLAttributes, rest, {
        controls: 'true',
        'data-cid': cid,
        class: 'am-article-video',
      }),
    ]
  },

  addCommands() {
    return {
      setVideo:
        (options) =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs: options }),
    }
  },
})
