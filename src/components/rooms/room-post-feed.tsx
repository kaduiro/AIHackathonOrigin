import { Card, CardContent } from '@/components/ui/card'
import { EmptyState } from '@/components/shared/empty-state'
import { MessageCircle } from 'lucide-react'

interface PostData {
  id: string
  title: string
  body: string
  created_at: string
  users?: { display_name: string; avatar_url: string | null } | null
}

interface RoomPostFeedProps { posts: PostData[]; roomId: string }

export function RoomPostFeed({ posts }: RoomPostFeedProps) {
  if (posts.length === 0) {
    return <EmptyState icon={<MessageCircle className="h-12 w-12" />} title="まだ投稿がありません" description="最初の投稿をしてみましょう" />
  }

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">ルーム内の投稿</h2>
      {posts.map((post) => (
        <Card key={post.id}>
          <CardContent className="p-4 space-y-2">
            <h3 className="font-medium">{post.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-3">{post.body}</p>
            <div className="text-xs text-muted-foreground">
              {post.users?.display_name} · {new Date(post.created_at).toLocaleDateString('ja-JP')}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
