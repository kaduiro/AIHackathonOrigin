'use client'

import { useState, useTransition } from 'react'
import {
  approveVerificationAction,
  rejectVerificationAction,
  approveMentorAction,
  rejectMentorAction,
  approveRoomAction,
  rejectRoomAction,
} from '@/actions/admin'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Check, X } from 'lucide-react'

interface ReviewQueueProps {
  items: any[] // eslint-disable-line @typescript-eslint/no-explicit-any
  type: 'verification' | 'mentor' | 'room'
}

const statusLabels: Record<string, string> = {
  pending: '未提出',
  submitted: '審査待ち',
  approved: '承認済み',
  rejected: '却下済み',
}

export function ReviewQueue({ items, type }: ReviewQueueProps) {
  const [rejectReasons, setRejectReasons] = useState<Record<string, string>>({})
  const [isPending, startTransition] = useTransition()

  const handleApprove = (item: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    startTransition(async () => {
      if (type === 'verification') await approveVerificationAction(item.id, item.user_id)
      else if (type === 'mentor') await approveMentorAction(item.id, item.user_id)
      else if (type === 'room') await approveRoomAction(item.id, item.creator_id)
    })
  }

  const handleReject = (item: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    const reason = rejectReasons[item.id] || '基準を満たしていません'
    startTransition(async () => {
      if (type === 'verification') await rejectVerificationAction(item.id, item.user_id, reason)
      else if (type === 'mentor') await rejectMentorAction(item.id, item.user_id)
      else if (type === 'room') await rejectRoomAction(item.id, item.creator_id)
    })
  }

  if (items.length === 0) {
    return <p className="text-muted-foreground text-center py-8">審査待ちの項目はありません</p>
  }

  return (
    <div className="space-y-3">
      {items.map(item => {
        const status = type === 'room' ? item.approval_status : item.status
        const isActionable = status === 'submitted' || status === 'pending'
        return (
          <Card key={item.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">
                      {item.users?.display_name || item.title || '不明'}
                    </span>
                    <Badge variant={status === 'approved' ? 'secondary' : status === 'rejected' ? 'destructive' : 'outline'}>
                      {statusLabels[status] || status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {item.users?.email || item.description || ''}
                    {item.birth_date && ` · 生年月日: ${item.birth_date}`}
                  </p>
                </div>
                {isActionable && (
                  <div className="flex items-center gap-2">
                    {type === 'verification' && (
                      <Input
                        placeholder="却下理由"
                        className="w-32 text-xs"
                        value={rejectReasons[item.id] || ''}
                        onChange={e => setRejectReasons(prev => ({ ...prev, [item.id]: e.target.value }))}
                      />
                    )}
                    <Button size="sm" onClick={() => handleApprove(item)} disabled={isPending}>
                      <Check className="mr-1 h-3 w-3" />
                      承認
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleReject(item)} disabled={isPending}>
                      <X className="mr-1 h-3 w-3" />
                      却下
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
