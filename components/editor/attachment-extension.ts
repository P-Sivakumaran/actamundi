import { Node, mergeAttributes } from '@tiptap/core'
import { formatBytes } from '@/lib/utils'

export interface AttachmentOptions {
  HTMLAttributes: Record<string, unknown>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    attachment: {
      setAttachment: (options: { href: string; cid: string; filename: string; size: number }) => ReturnType
    }
  }
}

/** Generic "download this file" card for media types that can't be
 * rendered inline (PDFs, docs, zips, anything that isn't image/video/
 * audio). Unlike video/audio's `cid`, `filename` and `size` here are
 * display-critical, not just provenance — losing them on re-edit would
 * show a broken-looking link — so both round-trip through real data-*
 * attributes with explicit per-attribute parseHTML, not the
 * accept-data-loss shortcut video/audio use for their own `cid`. */
export const Attachment = Node.create<AttachmentOptions>({
  name: 'attachment',
  group: 'block',
  atom: true,
  draggable: true,

  addOptions() {
    return { HTMLAttributes: {} }
  },

  addAttributes() {
    return {
      href: { default: null },
      cid: { default: null, parseHTML: (el) => el.getAttribute('data-cid') },
      filename: { default: null, parseHTML: (el) => el.getAttribute('data-filename') },
      size: {
        default: null,
        parseHTML: (el) => {
          const raw = el.getAttribute('data-size')
          return raw ? Number(raw) : null
        },
      },
    }
  },

  parseHTML() {
    return [{ tag: 'a.am-article-attachment' }]
  },

  renderHTML({ HTMLAttributes }) {
    const { cid, filename, size, ...rest } = HTMLAttributes
    const label = `${filename ?? 'Attachment'} (${formatBytes(Number(size) || 0)})`
    return [
      'a',
      mergeAttributes(this.options.HTMLAttributes, rest, {
        download: filename ?? undefined,
        target: '_blank',
        rel: 'noopener noreferrer',
        'data-cid': cid,
        'data-filename': filename,
        'data-size': size,
        class: 'am-article-attachment',
      }),
      label,
    ]
  },

  addCommands() {
    return {
      setAttachment:
        (options) =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs: options }),
    }
  },
})
