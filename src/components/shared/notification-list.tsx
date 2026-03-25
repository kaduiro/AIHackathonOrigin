'use client'

import { useTransition } from 'react'
import { markNotificationReadAction, markAllNotificationsReadAction } from '@/actions/admin'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

const typeLabels: Record<string, string> = {
  approval: '承認',
  rejection: '却下',
  booking: '予約',
  report: '通報',
  system: 'システム',
}

interface NotificationListProps {
  notifications: any[] // eslint-disable-line @typescript-eslint/no-explicit-any
}

export function NotificationList({ notifications }: NotificationListProps) {
  const [isPending, startTransition] = useTransition()
  const unreadCount = notifications.filter(n => !n.is_read).length

  const handleMarkRead = (id: string) => {
    startTransition(async () => {
      await markNotificationReadAction(id)
    })
  }

  const handleMarkAllRead = () => {
    startTransition(async () => {
      await markAllNotificationsReadAction()
    })
  }

  if (notifications.length === 0) {
    return <p className="text-center text-muted-foreground py-8">通知はありません</p>
  }

  return (
    <div className="space-y-3">
      {unreadCount > 0 && (
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={handleMarkAllRead} disabled={isPending}>
            <CheckCheck className="mr-1 h-4 w-4" />
            すべて既読にする
          </Button>
        </div>
      )}
      {notifications.map((notification: any) => ( // eslint-disable-line @typescript-eslint/no-explicit-any
        <Card key={notification.id} className={cn(!notification.is_read && 'border-primary/50 bg-primary/5')}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {typeLabels[notification.type] || notification.type}
                  </Badge>
                  <span className="text-sm font-medium">{notification.title}</span>
                </div>
                <p className="text-sm text-muted-foreground">{notification.message}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(notification.created_at).toLocaleString('ja-JP')}
                </p>
              </div>
              {!notification.is_read && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleMarkRead(notification.id)}
                  disabled={isPending}
                >
                  既読
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
