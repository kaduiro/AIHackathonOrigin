import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChevronRight } from 'lucide-react'
import { ROUTES } from '@/constants/routes'
import { EmptyState } from '@/components/shared/empty-state'

interface FeedSectionProps {
  title: string
  posts: any[]
  emptyMessage: string
}

export function FeedSection({ title, posts, emptyMessage }: FeedSectionProps) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{title}</h2>
        <Link
          href={ROUTES.QA}
          className="flex items-center text-sm text-muted-foreground hover:text-primary"
        >
          すべて見る
          <ChevronRight className="ml-1 h-4 w-4" />
        </Link>
      </div>
      {posts.length === 0 ? (
        <EmptyState title="投稿がありません" description={emptyMessage} />
      ) : (
        <div className="space-y-2">
          {posts.map((post) => (
            <Link key={post.id} href={ROUTES.QA_DETAIL(post.id)}>
              <Card className="transition-colors hover:bg-muted/50">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="line-clamp-2 font-medium leading-snug">{post.title}</h3>
                      {post.type === 'question' && (
                        <Badge variant="outline" className="shrink-0 text-xs">質問</Badge>
                      )}
                    </div>
                    <p className="line-clamp-2 text-sm text-muted-foreground">{post.body}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{post.users?.display_name || '匿名'}</span>
                      <span>{new Date(post.created_at).toLocaleDateString('ja-JP')}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}
