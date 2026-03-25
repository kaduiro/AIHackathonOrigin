'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { joinEventAction, cancelParticipationAction } from '@/actions/events'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Calendar, MapPin, Users, ArrowLeft, AlertCircle, Shield } from 'lucide-react'

interface EventDetailProps { event: any; participation: any; participantCount: number; userAgeGroup: string }

export function EventDetail({ event, participation, participantCount, userAgeGroup }: EventDetailProps) {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const isRegistered = participation?.status === 'registered'
  const formatLabels: Record<string, string> = { online: 'オンライン', offline: 'オフライン', hybrid: 'ハイブリッド' }

  const handleJoin = () => {
    setError(null)
    startTransition(async () => {
      const result = await joinEventAction(event.id)
      if (!result.success) setError(result.error || 'エラーが発生しました')
    })
  }

  const handleCancel = () => {
    if (!confirm('参加をキャンセルしますか？')) return
    startTransition(async () => {
      await cancelParticipationAction(event.id)
    })
  }

  return (
    <Card>
      <CardHeader>
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="w-fit mb-2">
          <ArrowLeft className="mr-1 h-4 w-4" />戻る
        </Button>
        <CardTitle>{event.title}</CardTitle>
        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{new Date(event.start_at).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
          <Badge variant="outline">{formatLabels[event.format] || event.format}</Badge>
          {event.location && <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{event.location}</span>}
          <span className="flex items-center gap-1"><Users className="h-4 w-4" />{participantCount}人参加</span>
          {event.age_restriction === 'adult_only' && <Badge variant="outline" className="gap-1"><Shield className="h-3 w-3" />18+</Badge>}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="whitespace-pre-wrap text-sm">{event.description}</div>
        <p className="text-sm text-muted-foreground">主催: {event.users?.display_name}</p>

        {error && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>}

        {event.status === 'published' && (
          isRegistered ? (
            <div className="flex items-center gap-3">
              <Badge className="bg-green-100 text-green-800">参加済み</Badge>
              <Button variant="ghost" size="sm" onClick={handleCancel} disabled={isPending}>キャンセル</Button>
            </div>
          ) : (
            <Button onClick={handleJoin} disabled={isPending} className="w-full">
              {isPending ? '処理中...' : '参加する'}
            </Button>
          )
        )}
        {event.status === 'stopped' && <Badge variant="destructive">停止済み</Badge>}
        {event.status === 'cancelled' && <Badge variant="secondary">キャンセル済み</Badge>}
      </CardContent>
    </Card>
  )
}
