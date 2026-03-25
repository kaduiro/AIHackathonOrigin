'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { toggleReactionAction, deletePostAction, reportAction } from '@/actions/qa'
import { ThumbsUp, Flag, Trash2, ArrowLeft } from 'lucide-react'
import { ROUTES } from '@/constants/routes'
import { cn } from '@/lib/utils'

interface QADetailProps {
  post: any
  reactionCount: number
  userReactions: string[]
  isAuthor: boolean
}

export function QADetail({ post, reactionCount, userReactions, isAuthor }: QADetailProps) {
  const [liked, setLiked] = useState(userReactions.includes('like'))
  const [count, setCount] = useState(reactionCount)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleLike = () => {
    startTransition(async () => {
      await toggleReactionAction('post', post.id, 'like')
      setLiked(!liked)
      setCount(prev => liked ? prev - 1 : prev + 1)
    })
  }

  const handleDelete = () => {
    if (!confirm('この投稿を削除しますか？')) return
    startTransition(async () => {
      await deletePostAction(post.id)
      router.push(ROUTES.QA)
    })
  }

  const handleReport = () => {
    startTransition(async () => {
      await reportAction({
        targetType: 'post',
        targetId: post.id,
        reason: '不適切な内容',
      })
      alert('通報を受け付けました')
    })
  }

  return (
    <Card>
      <CardHeader>
        <div className="mb-2 flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="mr-1 h-4 w-4" />戻る
          </Button>
        </div>
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h1 className="text-xl font-bold">{post.title}</h1>
            <Badge variant="outline">
              {post.type === 'question' ? '質問' : '議論'}
            </Badge>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span>{post.users?.display_name || '匿名'}</span>
            <span>{new Date(post.created_at).toLocaleDateString('ja-JP', {
              year: 'numeric', month: 'long', day: 'numeric'
            })}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="whitespace-pre-wrap text-sm leading-relaxed">{post.body}</div>

        {post.tags && post.tags.length > 0 && (
          <div className="flex gap-1">
            {post.tags.map((tag: string) => (
              <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2 border-t pt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            disabled={isPending}
            className={cn(liked && 'text-primary')}
          >
            <ThumbsUp className={cn('mr-1 h-4 w-4', liked && 'fill-current')} />
            {count}
          </Button>

          {!isAuthor && (
            <Button variant="ghost" size="sm" onClick={handleReport} disabled={isPending}>
              <Flag className="mr-1 h-4 w-4" />通報
            </Button>
          )}

          {isAuthor && (
            <Button variant="ghost" size="sm" onClick={handleDelete} disabled={isPending} className="text-destructive">
              <Trash2 className="mr-1 h-4 w-4" />削除
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
