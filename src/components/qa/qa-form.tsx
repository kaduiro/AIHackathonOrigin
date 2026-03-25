'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createPostAction } from '@/actions/qa'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, AlertTriangle } from 'lucide-react'
import { ROUTES } from '@/constants/routes'

const TEMPLATE = `【困っていること】


【試したこと】


【どうなりたいか】

`

export function QAForm() {
  const [error, setError] = useState<string | null>(null)
  const [heldMessage, setHeldMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleSubmit = (formData: FormData) => {
    setError(null)
    setHeldMessage(null)
    startTransition(async () => {
      const result = await createPostAction({
        title: formData.get('title') as string,
        body: formData.get('body') as string,
        type: 'question',
        tags: [],
      })

      if (!result.success) {
        setError(result.error || 'エラーが発生しました')
        return
      }

      if (result.data?.held) {
        setHeldMessage('投稿は確認のため一時保留されました。管理者が確認後に公開されます。')
        return
      }

      router.push(ROUTES.QA_DETAIL(result.data!.id as string))
    })
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form action={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {heldMessage && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{heldMessage}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">タイトル</Label>
            <Input
              id="title"
              name="title"
              placeholder="例: Next.jsでSupabaseの認証を実装する方法"
              required
              minLength={5}
              maxLength={200}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="body">本文</Label>
            <Textarea
              id="body"
              name="body"
              placeholder={TEMPLATE}
              required
              minLength={10}
              maxLength={5000}
              rows={12}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              テンプレートに沿って書くと、回答がもらいやすくなります
            </p>
          </div>

          <div className="flex gap-3">
            <Button type="submit" className="flex-1" disabled={isPending}>
              {isPending ? '投稿中...' : '投稿する'}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              キャンセル
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
