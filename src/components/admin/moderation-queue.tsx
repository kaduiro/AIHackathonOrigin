'use client'

import { useTransition } from 'react'
import { reviewModerationAction } from '@/actions/admin'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Check, X } from 'lucide-react'

interface ModerationQueueProps {
  cases: any[] // eslint-disable-line @typescript-eslint/no-explicit-any
}

export function ModerationQueue({ cases }: ModerationQueueProps) {
  const [isPending, startTransition] = useTransition()

  const handleReview = (caseId: string, decision: 'approved' | 'rejected') => {
    startTransition(async () => {
      await reviewModerationAction(caseId, decision)
    })
  }

  if (cases.length === 0) {
    return <p className="text-sm text-muted-foreground">保留中のコンテンツはありません</p>
  }

  return (
    <div className="space-y-3">
      {cases.map((c: any) => ( // eslint-disable-line @typescript-eslint/no-explicit-any
        <Card key={c.id}>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Badge variant={c.ai_label === 'held' ? 'destructive' : 'default'}>
                  {c.ai_label}
                </Badge>
                <span className="text-sm">
                  {c.target_type} · {c.target_id.slice(0, 8)}
                </span>
              </div>
              {c.reasons && c.reasons.length > 0 && (
                <p className="text-xs text-muted-foreground mt-1">{c.reasons.join(', ')}</p>
              )}
              {c.flagged_words && c.flagged_words.length > 0 && (
                <p className="text-xs text-red-500 mt-1">検出: {c.flagged_words.join(', ')}</p>
              )}
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => handleReview(c.id, 'approved')} disabled={isPending}>
                <Check className="mr-1 h-3 w-3" />
                公開
              </Button>
              <Button size="sm" variant="destructive" onClick={() => handleReview(c.id, 'rejected')} disabled={isPending}>
                <X className="mr-1 h-3 w-3" />
                却下
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
