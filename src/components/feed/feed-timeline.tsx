import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ROUTES } from '@/constants/routes'
import { EmptyState } from '@/components/shared/empty-state'
import { ThumbsUp, MessageCircle, Users, Sparkles, Clock, ShieldCheck } from 'lucide-react'
import type { MatchResult } from '@/services/matching'

interface FeedTimelineProps {
  posts: any[]
  communities: MatchResult[]
  rooms: any[]
}

export function FeedTimeline({ posts, communities, rooms }: FeedTimelineProps) {
  const feedItems: { type: 'post' | 'room_highlight' | 'safety'; data: any; index: number }[] = []

  posts.forEach((post, i) => {
    feedItems.push({ type: 'post', data: post, index: i })
    if (i === 2 && rooms.length > 0) {
      feedItems.push({ type: 'room_highlight', data: rooms.slice(0, 4), index: i })
    }
    if (i === 4) {
      feedItems.push({ type: 'safety', data: null, index: i })
    }
  })

  if (feedItems.length === 0) {
    return (
      <EmptyState
        title="まだ投稿がありません"
        description="最初の質問を投稿して、コミュニティを盛り上げましょう！"
      />
    )
  }

  return (
    <div className="space-y-3 mt-4">
      <h2 className="text-sm font-medium text-muted-foreground flex items-center gap-1">
        <Clock className="h-3.5 w-3.5" /> タイムライン
      </h2>

      {feedItems.map((item, idx) => {
        if (item.type === 'post') {
          const post = item.data
          return (
            <Link key={`post-${post.id}`} href={ROUTES.QA_DETAIL(post.id)}>
              <Card className="transition-all hover:bg-muted/50 hover:shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-purple-500 text-xs font-bold text-white">
                      {(post.users?.display_name || '?')[0]}
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{post.users?.display_name || '匿名'}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatTimeAgo(post.created_at)}
                        </span>
                      </div>
                      <h3 className="font-medium leading-snug">{post.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{post.body}</p>
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {post.tags.map((tag: string) => (
                            <span key={tag} className="text-xs text-primary font-medium">#{tag}</span>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center gap-4 pt-2 text-muted-foreground">
                        <span className="flex items-center gap-1 text-xs hover:text-primary transition-colors">
                          <ThumbsUp className="h-3.5 w-3.5" /> いいね
                        </span>
                        <span className="flex items-center gap-1 text-xs hover:text-primary transition-colors">
                          <MessageCircle className="h-3.5 w-3.5" /> コメント
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        }

        if (item.type === 'room_highlight') {
          const roomList = item.data as any[]
          return (
            <div key={`rooms-${idx}`} className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" /> アクティブなルーム
                </h3>
                <Link href={ROUTES.ROOMS} className="text-xs text-primary hover:underline">
                  すべて見る
                </Link>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {roomList.map((room: any) => (
                  <Link
                    key={room.id}
                    href={ROUTES.ROOM_DETAIL(room.id)}
                    className="flex-shrink-0 w-44"
                  >
                    <Card className="h-full transition-all hover:shadow-sm hover:border-primary/30">
                      <CardContent className="p-3 space-y-1">
                        <div className="flex items-center gap-1.5">
                          <Users className="h-3.5 w-3.5 text-primary" />
                          <span className="text-xs font-medium truncate">{room.title}</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground line-clamp-2">{room.description}</p>
                        <p className="text-[10px] text-muted-foreground">{room.communities?.name}</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )
        }

        if (item.type === 'safety') {
          return (
            <div key="safety" className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
              <span>このコミュニティは安全に設計されています。外部SNSの交換は禁止です。</span>
            </div>
          )
        }

        return null
      })}
    </div>
  )
}

function formatTimeAgo(dateStr: string): string {
  const now = Date.now()
  const date = new Date(dateStr).getTime()
  const diff = now - date
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'たった今'
  if (minutes < 60) return `${minutes}分前`
  if (hours < 24) return `${hours}時間前`
  if (days < 7) return `${days}日前`
  return new Date(dateStr).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })
}
