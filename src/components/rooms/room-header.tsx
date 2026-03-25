'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { joinRoomAction, leaveRoomAction } from '@/actions/rooms'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Users, Lock, Shield, ArrowLeft, AlertCircle, LogOut } from 'lucide-react'

interface RoomHeaderProps {
  room: { id: string; title: string; description: string; approval_required: boolean; age_policy: string; communities?: { name: string } | null }
  memberCount: number
  membership: { status: string } | null
  userAgeGroup: string
}

export function RoomHeader({ room, memberCount, membership, userAgeGroup }: RoomHeaderProps) {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const isMember = membership?.status === 'approved'
  const isPendingMember = membership?.status === 'pending'

  const handleJoin = () => {
    setError(null)
    startTransition(async () => {
      const result = await joinRoomAction(room.id)
      if (!result.success) {
        setError(result.error || 'エラーが発生しました')
      }
    })
  }

  const handleLeave = () => {
    if (!confirm('このルームを退出しますか？')) return
    startTransition(async () => {
      await leaveRoomAction(room.id)
    })
  }

  return (
    <Card>
      <CardHeader>
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="w-fit mb-2">
          <ArrowLeft className="mr-1 h-4 w-4" />戻る
        </Button>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">{room.communities?.name}</p>
            <CardTitle>{room.title}</CardTitle>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{memberCount}人</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{room.description}</p>
        <div className="flex gap-1">
          {room.approval_required && <Badge variant="outline" className="gap-1"><Lock className="h-3 w-3" />承認制</Badge>}
          {room.age_policy === 'adult_only' && <Badge variant="outline" className="gap-1"><Shield className="h-3 w-3" />18+</Badge>}
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!isMember && !isPendingMember && (
          <Button onClick={handleJoin} disabled={isPending} className="w-full">
            {isPending ? '処理中...' : room.approval_required ? '参加を申請する' : '参加する'}
          </Button>
        )}
        {isPendingMember && (
          <Button disabled className="w-full" variant="outline">承認待ち</Button>
        )}
        {isMember && (
          <Button variant="ghost" size="sm" onClick={handleLeave} disabled={isPending}>
            <LogOut className="mr-1 h-4 w-4" />退出する
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
