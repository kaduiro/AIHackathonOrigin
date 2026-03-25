'use client'

import { useState, useTransition } from 'react'
import { bookConsultationAction } from '@/actions/mentors'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, CheckCircle, Calendar } from 'lucide-react'

interface BookingSectionProps { mentorUserId: string; slots: any[] }

export function BookingSection({ mentorUserId, slots }: BookingSectionProps) {
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [topic, setTopic] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleBook = () => {
    if (!selectedSlot || !topic.trim()) return
    setError(null)
    startTransition(async () => {
      const result = await bookConsultationAction({
        slotId: selectedSlot,
        mentorUserId,
        topic: topic.trim(),
        message: message.trim() || undefined,
      })
      if (result.success) {
        setSuccess(true)
      } else {
        setError(result.error || 'エラーが発生しました')
      }
    })
  }

  if (success) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <CheckCircle className="h-12 w-12 text-green-500" />
            <h3 className="text-lg font-semibold">予約が完了しました</h3>
            <p className="text-sm text-muted-foreground">メンターからの確認をお待ちください。</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Calendar className="h-5 w-5" />相談を予約する
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>}

        {slots.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            現在利用可能な枠がありません
          </p>
        ) : (
          <>
            <div className="space-y-2">
              <Label>日時を選択</Label>
              <div className="grid gap-2 sm:grid-cols-2">
                {slots.map(slot => (
                  <button
                    key={slot.id}
                    onClick={() => setSelectedSlot(slot.id)}
                    className={`rounded-md border p-3 text-left text-sm transition-colors ${selectedSlot === slot.id ? 'border-primary bg-primary/5' : 'hover:bg-muted'}`}
                  >
                    <div className="font-medium">
                      {new Date(slot.start_at).toLocaleDateString('ja-JP', { month: 'long', day: 'numeric' })}
                    </div>
                    <div className="text-muted-foreground">
                      {new Date(slot.start_at).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                      {' - '}
                      {new Date(slot.end_at).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="topic">相談テーマ</Label>
              <Input id="topic" value={topic} onChange={e => setTopic(e.target.value)} placeholder="例: キャリアについて相談したい" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">メッセージ（任意）</Label>
              <Textarea id="message" value={message} onChange={e => setMessage(e.target.value)} placeholder="相談したい内容の詳細" rows={3} />
            </div>

            <Button onClick={handleBook} disabled={isPending || !selectedSlot || !topic.trim()} className="w-full">
              {isPending ? '予約中...' : '予約を確定する'}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}
