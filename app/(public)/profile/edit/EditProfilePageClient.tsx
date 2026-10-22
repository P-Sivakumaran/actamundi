'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useWalletAddress } from '@/hooks/use-wallet-address'
import { useProfile } from '@/hooks/use-profile'
import { publishBlob } from '@/lib/p2p/articles'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

/** Always "my own profile" — no [address] param, so this just prompts a
 * wallet connect if none is active instead of resolving someone else's. */
export default function EditProfilePageClient() {
  const router = useRouter()
  const { address, connecting, connect } = useWalletAddress()
  const { profile, publish, loading, error } = useProfile(address ?? undefined)

  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [avatarCid, setAvatarCid] = useState<string | undefined>(undefined)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const avatarInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!profile) return
    setDisplayName(profile.displayName ?? '')
    setBio(profile.bio ?? '')
    setAvatarCid(profile.avatarCid)
  }, [profile])

  async function handleAvatarSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setUploadError(null)
    setUploadingAvatar(true)
    try {
      const bytes = new Uint8Array(await file.arrayBuffer())
      setAvatarCid(await publishBlob(bytes))
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Avatar upload failed')
    } finally {
      setUploadingAvatar(false)
    }
  }

  async function handleSave() {
    await publish({
      displayName: displayName || undefined,
      bio: bio || undefined,
      avatarCid,
    })
    if (address) router.push(`/profile/${address}`)
  }

  if (!address) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Button onClick={() => connect()} disabled={connecting}>
          {connecting ? 'Connecting...' : 'Connect wallet to edit your profile'}
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg">
      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-2xl">Edit your profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/15 px-4 py-3 text-sm text-destructive">{error}</div>
          )}

          <div className="space-y-2">
            <Label htmlFor="displayName">Display name</Label>
            <Input id="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} className="min-h-[100px]" />
          </div>

          <div className="space-y-2">
            <Label>Avatar</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => avatarInputRef.current?.click()}
              disabled={uploadingAvatar}
            >
              {uploadingAvatar ? 'Uploading…' : avatarCid ? 'Change image' : 'Upload image'}
            </Button>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarSelected}
            />
            {uploadError && <p className="text-xs text-destructive">{uploadError}</p>}
          </div>

          <Button className="w-full" disabled={loading || uploadingAvatar} onClick={handleSave}>
            {loading ? 'Saving…' : 'Save profile'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
