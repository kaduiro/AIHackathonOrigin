import { getCurrentUser } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ROUTES } from '@/constants/routes'
import { PageHeader } from '@/components/layout/page-header'
import { RoomCard } from '@/components/rooms/room-card'
import { EmptyState } from '@/components/shared/empty-state'
import { Users } from 'lucide-react'

export default async function RoomListPage() {
  const user = await getCurrentUser()
  if (!user) redirect(ROUTES.LOGIN)

  const supabase = await createClient()
  const { data: rooms } = await supabase
    .from('rooms')
    .select('*')
    .eq('approval_status', 'approved')
    .order('created_at', { ascending: false })

  return (
    <div className="container max-w-3xl space-y-4 py-4">
      <PageHeader title="ルーム" description="興味のあるルームに参加して、仲間と交流しよう" />

      {(!rooms || rooms.length === 0) ? (
        <EmptyState
          icon={<Users className="h-12 w-12" />}
          title="まだルームがありません"
          description="ルームが承認されるとここに表示されます"
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {rooms.map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>
      )}
    </div>
  )
}
