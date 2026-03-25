'use client'

import { useState, useTransition } from 'react'
import { createCommentAction } from '@/actions/qa'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, AlertTriangle, Send } from 'lucide-react'

interface CommentFormProps {
  postId: string
}

export function CommentForm({ postId }: CommentFormProps) {
  const [body, setBody] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [heldMessage, setHeldMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleSubmit = () => {
    if (!body.trim()) return
    setError(null)
    setHeldMessage(null)
    startTransition(async () => {
      const result = await createCommentAction({ body: body.trim(), postId })
      if (!result.success) {
        setError(result.error || 'エラーが発生しました')
        return
      }
      if (result.data?.held) {
        setHeldMessage('コメントは確認のため一時保留されました。')
      }
      setBody('')
    })
  }

  return (
    <Card>
      <CardContent className="space-y-3">
        <h3 className="font-semibold">回答を投稿</h3>
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
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="あなたの知見を共有しましょう..."
          rows={4}
          maxLength={2000}
        />
        <div className="flex justify-end">
          <Button onClick={handleSubmit} disabled={isPending || !body.trim()} size="sm">
            <Send className="mr-1 h-4 w-4" />
            {isPending ? '投稿中...' : '回答する'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
