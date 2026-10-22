'use client'

import { useRef, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import mammoth from 'mammoth'
import { Video } from '@/components/editor/video-extension'
import { Audio } from '@/components/editor/audio-extension'
import { Attachment } from '@/components/editor/attachment-extension'
import { Button } from '@/components/ui/button'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link as LinkIcon,
  Image as ImageIcon,
  Video as VideoIcon,
  Music,
  Paperclip,
  FileUp,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { publishBlob, coverImageUrl } from '@/lib/p2p/articles'

const MAX_DOC_BYTES = 25 * 1024 * 1024 // 25MB

// Hard caps, not a transcode/compression step — this app stores media as raw
// bytes in each peer's own browser IndexedDB, with no server, no pinning
// service, no CDN. A multi-hundred-MB file would make replication to other
// peers slow or unreliable with nothing in this codebase to soften that.
type MediaKind = 'image' | 'video' | 'audio' | 'file'
const MAX_BYTES: Record<MediaKind, number> = {
  image: 10 * 1024 * 1024, // 10MB
  video: 50 * 1024 * 1024, // 50MB
  audio: 20 * 1024 * 1024, // 20MB
  file: 25 * 1024 * 1024, // 25MB — generic attachments (PDFs, docs, etc.)
}
const MEDIA_LABEL: Record<MediaKind, string> = {
  image: 'Image', video: 'Video', audio: 'Audio', file: 'File',
}

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
}

export default function RichTextEditor({
  content,
  onChange,
  placeholder,
}: RichTextEditorProps) {
  const [uploading, setUploading] = useState<MediaKind | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [importingDoc, setImportingDoc] = useState(false)
  const [pendingDocHtml, setPendingDocHtml] = useState<string | null>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const audioInputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const docInputRef = useRef<HTMLInputElement>(null)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Video,
      Audio,
      Attachment,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          rel: 'noopener noreferrer',
        },
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[200px] p-4',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  if (!editor) {
    return null
  }

  const addLink = () => {
    const url = window.prompt('Enter the URL:')
    if (url) {
      editor.chain().focus().setLink({ href: url }).run()
    }
  }

  async function handleMediaSelected(kind: MediaKind, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = '' // let the same file be picked again after an error
    if (!file || !editor) return

    const max = MAX_BYTES[kind]
    if (file.size > max) {
      setUploadError(`${MEDIA_LABEL[kind]} is ${Math.round(file.size / 1024 / 1024)}MB — the limit is ${max / 1024 / 1024}MB.`)
      return
    }

    setUploadError(null)
    setUploading(kind)
    try {
      const bytes = new Uint8Array(await file.arrayBuffer())
      const cid = await publishBlob(bytes)
      const src = coverImageUrl(cid)
      if (!src) throw new Error('Could not resolve an upload URL')

      switch (kind) {
        case 'image':
          editor.chain().focus().setImage({ src }).run()
          break
        case 'video':
          editor.chain().focus().setVideo({ src, cid }).run()
          break
        case 'audio':
          editor.chain().focus().setAudio({ src, cid }).run()
          break
        case 'file':
          editor.chain().focus().setAttachment({ href: src, cid, filename: file.name, size: file.size }).run()
          break
      }
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : `${MEDIA_LABEL[kind]} upload failed`)
    } finally {
      setUploading(null)
    }
  }

  // .docx only — .doc (legacy binary Word) and .odt have no reliable
  // client-side parser, and this app has no backend to run a real converter
  // (LibreOffice headless, etc.) against. Converted HTML is semantic
  // (headings/bold/lists), so it picks up the editor's and the published
  // page's existing Tailwind Typography `prose` styling for free — no
  // separate "make it pretty" pass needed.
  async function handleDocSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || !editor) return

    const isDocx =
      file.name.toLowerCase().endsWith('.docx') ||
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    if (!isDocx) {
      setUploadError('Only .docx is supported — legacy .doc and OpenDocument (.odt) files can\'t be parsed reliably in the browser.')
      return
    }
    if (file.size > MAX_DOC_BYTES) {
      setUploadError(`Document is ${Math.round(file.size / 1024 / 1024)}MB — the limit is ${MAX_DOC_BYTES / 1024 / 1024}MB.`)
      return
    }

    setUploadError(null)
    setImportingDoc(true)
    try {
      const arrayBuffer = await file.arrayBuffer()
      const { value: html } = await mammoth.convertToHtml(
        { arrayBuffer },
        {
          // Embedded images become their own p2p blobs (consistent with
          // every other media path in this editor), not base64 data URIs
          // bloating the stored article HTML.
          convertImage: mammoth.images.imgElement(async (image) => {
            const bytes = new Uint8Array(await image.readAsArrayBuffer())
            const cid = await publishBlob(bytes)
            const src = coverImageUrl(cid)
            if (src) return { src }
            return { src: `data:${image.contentType};base64,${await image.readAsBase64String()}` }
          }),
        }
      )

      if (editor.isEmpty) {
        editor.commands.setContent(html)
        onChange(editor.getHTML())
      } else {
        // Don't silently discard whatever's already been written — confirm first.
        setPendingDocHtml(html)
      }
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Could not read that document')
    } finally {
      setImportingDoc(false)
    }
  }

  function applyPendingDoc() {
    if (!pendingDocHtml || !editor) return
    editor.commands.setContent(pendingDocHtml)
    onChange(editor.getHTML())
    setPendingDocHtml(null)
  }

  return (
    <div className="border rounded-md">
      <div className="border-b p-2 flex flex-wrap gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={cn(editor.isActive('bold') && 'bg-accent')}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={cn(editor.isActive('italic') && 'bg-accent')}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={cn(editor.isActive('bulletList') && 'bg-accent')}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={cn(editor.isActive('orderedList') && 'bg-accent')}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={cn(editor.isActive('blockquote') && 'bg-accent')}
        >
          <Quote className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
        >
          <Redo className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={addLink}
          className={cn(editor.isActive('link') && 'bg-accent')}
        >
          <LinkIcon className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => imageInputRef.current?.click()} disabled={!!uploading}>
          <ImageIcon className="h-4 w-4" />
        </Button>
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleMediaSelected('image', e)}
        />
        <Button variant="ghost" size="sm" onClick={() => videoInputRef.current?.click()} disabled={!!uploading}>
          <VideoIcon className="h-4 w-4" />
        </Button>
        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={(e) => handleMediaSelected('video', e)}
        />
        <Button variant="ghost" size="sm" onClick={() => audioInputRef.current?.click()} disabled={!!uploading}>
          <Music className="h-4 w-4" />
        </Button>
        <input
          ref={audioInputRef}
          type="file"
          accept="audio/*"
          className="hidden"
          onChange={(e) => handleMediaSelected('audio', e)}
        />
        <Button variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()} disabled={!!uploading}>
          <Paperclip className="h-4 w-4" />
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={(e) => handleMediaSelected('file', e)}
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => docInputRef.current?.click()}
          disabled={importingDoc}
          title="Import a .docx document"
        >
          <FileUp className="h-4 w-4" />
        </Button>
        <input
          ref={docInputRef}
          type="file"
          accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="hidden"
          onChange={handleDocSelected}
        />
      </div>
      {uploading && (
        <p className="border-b px-4 py-1.5 text-xs text-muted-foreground">
          Uploading {MEDIA_LABEL[uploading].toLowerCase()}…
        </p>
      )}
      {importingDoc && (
        <p className="border-b px-4 py-1.5 text-xs text-muted-foreground">Importing document…</p>
      )}
      {uploadError && (
        <p className="border-b px-4 py-1.5 text-xs text-destructive">{uploadError}</p>
      )}
      <EditorContent editor={editor} />

      <AlertDialog open={!!pendingDocHtml} onOpenChange={(open) => !open && setPendingDocHtml(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Replace current content?</AlertDialogTitle>
            <AlertDialogDescription>
              This article already has content. Importing the document replaces everything
              currently in the editor — this can&apos;t be undone from here.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingDocHtml(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={applyPendingDoc}>Replace</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
