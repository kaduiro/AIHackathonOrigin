import { Card, CardContent } from '@/components/ui/card'

interface CommentListProps {
  comments: any[]
  postId: string
  userId: string
}

export function CommentList({ comments }: CommentListProps) {
  if (comments.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-muted-foreground">
        まだ回答がありません。最初の回答を投稿してみましょう！
      </p>
    )
  }

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">回答 ({comments.length})</h2>
      {comments.map((comment: any) => (
        <Card key={comment.id}>
          <CardContent>
            <div className="space-y-2">
              <p className="whitespace-pre-wrap text-sm">{comment.body}</p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>{comment.users?.display_name || '匿名'}</span>
                <span>{new Date(comment.created_at).toLocaleDateString('ja-JP')}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
