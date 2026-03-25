'use client'

import { useTransition } from 'react'
import { stopEventAction } from '@/actions/admin'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

const statusLabels: Record<string, string> = {
  draft: '下書き',
  published: '公開中',
  cancelled: 'キャンセル',
  stopped: '停止',
  completed: '完了',
}

interface EventMonitorTableProps {
  events: any[] // eslint-disable-line @typescript-eslint/no-explicit-any
}

export function EventMonitorTable({ events }: EventMonitorTableProps) {
  const [isPending, startTransition] = useTransition()

  const handleStop = (eventId: string, creatorId: string) => {
    if (!confirm('このイベントを停止しますか？')) return
    startTransition(async () => {
      await stopEventAction(eventId, creatorId)
    })
  }

  if (events.length === 0) {
    return <p className="text-muted-foreground text-center py-8">イベントはありません</p>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>イベント名</TableHead>
          <TableHead>主催者</TableHead>
          <TableHead>開始日時</TableHead>
          <TableHead>ステータス</TableHead>
          <TableHead>操作</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {events.map((event: any) => ( // eslint-disable-line @typescript-eslint/no-explicit-any
          <TableRow key={event.id}>
            <TableCell className="font-medium">{event.title}</TableCell>
            <TableCell>{event.users?.display_name || '不明'}</TableCell>
            <TableCell>{new Date(event.start_at).toLocaleDateString('ja-JP')}</TableCell>
            <TableCell>
              <Badge variant={event.status === 'stopped' ? 'destructive' : 'outline'}>
                {statusLabels[event.status] || event.status}
              </Badge>
            </TableCell>
            <TableCell>
              {event.status === 'published' && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleStop(event.id, event.creator_id)}
                  disabled={isPending}
                >
                  停止
                </Button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
