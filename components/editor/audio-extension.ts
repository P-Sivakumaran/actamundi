import { Node, mergeAttributes } from '@tiptap/core'

export interface AudioOptions {
  HTMLAttributes: Record<string, unknown>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    audio: {
      setAudio: (options: { src: string; cid: string }) => ReturnType
    }
  }
}

/** Mirrors video-extension.ts exactly — same reasoning: no official
 * @tiptap/extension-audio exists, src is a resolved gateway URL baked in
 * at insert time since article.content is saved as plain HTML and never
 * re-hydrated through Tiptap on the read side. data-cid is provenance
 * only, not round-tripped back into the editor on re-edit (same tradeoff
 * video already accepts). */
export const Audio = Node.create<AudioOptions>({
  name: 'audio',
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
    return [{ tag: 'audio[src]' }]
  },

  renderHTML({ HTMLAttributes }) {
    const { cid, ...rest } = HTMLAttributes
    return [
      'audio',
      mergeAttributes(this.options.HTMLAttributes, rest, {
        controls: 'true',
        'data-cid': cid,
        class: 'am-article-audio',
      }),
    ]
  },

  addCommands() {
    return {
      setAudio:
        (options) =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs: options }),
    }
  },
})
