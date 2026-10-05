import { ArticleForm } from '@/components/admin/ArticleForm'

const AUTHOR = '0x71F29e4f8a2b6c9d1e3f5a7b8c9d0e1f2a3b4c5d'

export function NewArticle() {
  return (
    <ArticleForm
      heading="New Article"
      authorAddr={AUTHOR}
      initialValues={{
        title: '',
        excerpt: '',
        category: '',
        content: '',
        status: 'draft',
      }}
      submitLabel="Create Article"
      savingLabel="Publishing..."
      saving={false}
      error={null}
      onSubmit={() => {}}
      onCancel={() => {}}
    />
  )
}

export function EditWithContent() {
  return (
    <ArticleForm
      heading="Edit Article"
      authorAddr={AUTHOR}
      initialValues={{
        title: 'City council quietly rezones waterfront for private development',
        excerpt: 'Leaked planning documents show a fast-tracked rezoning that bypassed the usual public comment period.',
        category: 'World',
        content: '<p>Leaked planning documents obtained by this outlet show the rezoning was fast-tracked through a procedural loophole.</p>',
        status: 'published',
      }}
      submitLabel="Save Changes"
      savingLabel="Saving..."
      saving={false}
      error={null}
      onSubmit={() => {}}
      onCancel={() => {}}
    />
  )
}

export function WithError() {
  return (
    <ArticleForm
      heading="New Article"
      authorAddr={AUTHOR}
      initialValues={{ title: 'Draft title', excerpt: '', category: '', content: '', status: 'draft' }}
      submitLabel="Create Article"
      savingLabel="Publishing..."
      saving={false}
      error="Signature rejected — reconnect your wallet and try again."
      onSubmit={() => {}}
      onCancel={() => {}}
    />
  )
}
