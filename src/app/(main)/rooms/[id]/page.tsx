import { notFound, redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'
import { ROUTES } from '@/constants/routes'
import { RoomHeader } from '@/components/rooms/room-header'
import { RoomPostFeed } from '@/components/rooms/room-post-feed'

export default async function RoomDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user) redirect(ROUTES.LOGIN)

  const { id } = await params
  const supabase = await createClient()

  const { data: room } = await supabase
    .from('rooms')
    .select('*, communities(name)')
    .eq('id', id)
    .single()

  if (!room) notFound()

  // Get membership status
  const { data: membership } = await supabase
    .from('room_memberships')
    .select('*')
    .eq('room_id', id)
    .eq('user_id', user.id)
    .single()

  // Get member count
  const { count: memberCount } = await supabase
    .from('room_memberships')
    .select('*', { count: 'exact', head: true })
    .eq('room_id', id)
    .eq('status', 'approved')

  // Get room posts
  const { data: posts } = await supabase
    .from('posts')
    .select('*, users(display_name, avatar_url)')
    .eq('room_id', id)
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(20)

  const isMember = membership?.status === 'approved'

  return (
    <div className="container max-w-3xl space-y-6 py-4">
      <RoomHeader
        room={room}
        memberCount={memberCount || 0}
        membership={membership}
        userAgeGroup={user.age_group}
      />
      {isMember && <RoomPostFeed posts={posts || []} roomId={id} />}
    </div>
  )
}
