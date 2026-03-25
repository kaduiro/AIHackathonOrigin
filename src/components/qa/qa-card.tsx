import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ROUTES } from '@/constants/routes'

interface QACardProps {
  post: any
}

export function QACard({ post }: QACardProps) {
  return (
    <Link href={ROUTES.QA_DETAIL(post.id)}>
      <Card className="transition-colors hover:bg-muted/50">
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-medium leading-snug line-clamp-2">{post.title}</h3>
              <Badge variant="outline" className="shrink-0 text-xs">
                {post.type === 'question' ? '質問' : '議論'}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">{post.body}</p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>{post.users?.display_name || '匿名'}</span>
              <span>{new Date(post.created_at).toLocaleDateString('ja-JP')}</span>
              {post.tags && post.tags.length > 0 && (
                <div className="flex gap-1">
                  {post.tags.slice(0, 3).map((tag: string) => (
                    <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
