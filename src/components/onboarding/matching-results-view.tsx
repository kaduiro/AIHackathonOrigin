'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, ArrowRight, Sparkles } from 'lucide-react'
import { ROUTES } from '@/constants/routes'
import type { MatchResult } from '@/services/matching'

interface MatchingResultsViewProps {
  results: MatchResult[]
}

export function MatchingResultsView({ results }: MatchingResultsViewProps) {
  const hasResults = results.length > 0
  const topResults = results.slice(0, 6)

  return (
    <div className="space-y-6">
      {hasResults ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            {topResults.map((result, index) => (
              <Card key={result.community.id} className="relative overflow-hidden">
                {index < 3 && (
                  <div className="absolute right-2 top-2">
                    <Badge variant="secondary" className="gap-1">
                      <Sparkles className="h-3 w-3" />
                      おすすめ
                    </Badge>
                  </div>
                )}
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-base">{result.community.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {result.community.description}
                  </p>
                  {result.matchedTags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {result.matchedTags.map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {result.matchScore > 0 && (
                    <div className="text-xs text-muted-foreground">
                      マッチ度: {Math.round(result.matchScore * 100)}%
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
            コミュニティに参加するには、年齢確認が必要です
          </div>
        </>
      ) : (
        <div className="py-8 text-center text-muted-foreground">
          おすすめを表示するには、興味タグを選択してください
        </div>
      )}

      <div className="flex flex-col gap-3">
        <Button size="lg" className="w-full" render={<Link href={ROUTES.AGE_VERIFICATION} />}>
          年齢確認に進む
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" render={<Link href={ROUTES.INTERESTS} />}>
          タグを選び直す
        </Button>
      </div>
    </div>
  )
}
