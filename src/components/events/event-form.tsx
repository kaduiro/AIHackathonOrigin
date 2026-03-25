'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createEventAction } from '@/actions/events'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { ROUTES } from '@/constants/routes'

export function EventForm() {
  const [error, setError] = useState<string | null>(null)
  const [format, setFormat] = useState('online')
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleSubmit = (formData: FormData) => {
    setError(null)
    startTransition(async () => {
      const result = await createEventAction({
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        startAt: formData.get('startAt') as string,
        endAt: (formData.get('endAt') as string) || undefined,
        format,
        location: (formData.get('location') as string) || undefined,
        ageRestriction: (formData.get('ageRestriction') as string) || 'none',
        maxParticipants: formData.get('maxParticipants') ? parseInt(formData.get('maxParticipants') as string) : undefined,
      })
      if (!result.success) {
        setError(result.error || 'エラーが発生しました')
        return
      }
      router.push(ROUTES.EVENT_DETAIL(result.data.id))
    })
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form action={handleSubmit} className="space-y-4">
          {error && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>}

          <div className="space-y-2">
            <Label htmlFor="title">イベント名</Label>
            <Input id="title" name="title" required maxLength={200} placeholder="例: 初心者向けWeb開発ハンズオン" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">説明</Label>
            <Textarea id="description" name="description" required rows={6} placeholder="イベントの内容、対象者、準備物などを記入してください" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="startAt">開始日時</Label>
              <Input id="startAt" name="startAt" type="datetime-local" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endAt">終了日時（任意）</Label>
              <Input id="endAt" name="endAt" type="datetime-local" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>開催形式</Label>
            <div className="flex gap-2">
              {(['online', 'offline', 'hybrid'] as const).map(f => (
                <Button key={f} type="button" variant={format === f ? 'default' : 'outline'} size="sm" onClick={() => setFormat(f)}>
                  {{ online: 'オンライン', offline: 'オフライン', hybrid: 'ハイブリッド' }[f]}
                </Button>
              ))}
            </div>
          </div>

          {format !== 'online' && (
            <div className="space-y-2">
              <Label htmlFor="location">場所</Label>
              <Input id="location" name="location" placeholder="開催場所" />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="maxParticipants">定員（任意）</Label>
            <Input id="maxParticipants" name="maxParticipants" type="number" min={1} placeholder="制限なし" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ageRestriction">年齢制限</Label>
            <select id="ageRestriction" name="ageRestriction" className="w-full rounded-md border px-3 py-2 text-sm" defaultValue="none">
              <option value="none">制限なし</option>
              <option value="adult_only">18歳以上のみ</option>
              <option value="minor_friendly">未成年歓迎</option>
            </select>
          </div>

          <div className="flex gap-3">
            <Button type="submit" className="flex-1" disabled={isPending}>
              {isPending ? '作成中...' : 'イベントを作成'}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>キャンセル</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
