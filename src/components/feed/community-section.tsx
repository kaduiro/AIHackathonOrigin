import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, Sparkles, ChevronRight } from 'lucide-react'
import { ROUTES } from '@/constants/routes'
import type { MatchResult } from '@/services/matching'

interface CommunitySectionProps {
  title: string
  communities: MatchResult[]
}

export function CommunitySection({ title, communities }: CommunitySectionProps) {
  if (communities.length === 0) return null

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{title}</h2>
        <Link
          href={ROUTES.ROOMS}
          className="flex items-center text-sm text-muted-foreground hover:text-primary"
        >
          すべて見る
          <ChevronRight className="ml-1 h-4 w-4" />
        </Link>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {communities.map((result) => (
          <Card key={result.community.id} className="transition-colors hover:bg-muted/50">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <CardTitle className="truncate text-sm">{result.community.name}</CardTitle>
                </div>
                {result.matchScore > 0.5 && (
                  <Badge variant="secondary" className="shrink-0 gap-1 text-xs">
                    <Sparkles className="h-3 w-3" />
                    おすすめ
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="line-clamp-2 text-sm text-muted-foreground">
                {result.community.description}
              </p>
              {result.matchedTags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {result.matchedTags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
