import { getCurrentUser } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import { ROUTES } from '@/constants/routes'
import { createClient } from '@/lib/supabase/server'
import { getMatchingCommunities } from '@/services/matching'
import { EventStories } from '@/components/feed/event-stories'
import { TagFilterBar } from '@/components/feed/tag-filter-bar'
import { FeedTimeline } from '@/components/feed/feed-timeline'
import { FloatingActionButton } from '@/components/feed/floating-action-button'
import { StatusBadge } from '@/components/feed/status-badge'

export default async function HomePage() {
  const user = await getCurrentUser()
  if (!user) redirect(ROUTES.LOGIN)

  const supabase = await createClient()

  const recommendations = await getMatchingCommunities(user.id)

  const { data: userTags } = await supabase
    .from('user_tags')
    .select('tag_id, tags(id, name, category)')
    .eq('user_id', user.id)

  const { data: allTags } = await supabase
    .from('tags')
    .select('*')
    .order('display_order')

  const { data: recentPosts } = await supabase
    .from('posts')
    .select('*, users(id, display_name, avatar_url)')
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(20)

  const { data: upcomingEvents } = await supabase
    .from('events')
    .select('*, users(display_name)')
    .eq('status', 'published')
    .gte('start_at', new Date().toISOString())
    .order('start_at')
    .limit(10)

  const { data: activeRooms } = await supabase
    .from('rooms')
    .select('*, communities(name), room_memberships(count)')
    .eq('approval_status', 'approved')
    .order('created_at', { ascending: false })
    .limit(6)

  return (
    <div className="mx-auto max-w-2xl px-4 pb-20">
      {/* YOUTRUST-style status */}
      <StatusBadge user={user} />

      {/* Instagram stories-like events */}
      <EventStories events={upcomingEvents || []} />

      {/* Tag filter */}
      <TagFilterBar
        tags={allTags || []}
        userTagIds={(userTags || []).map((ut: any) => ut.tag_id)}
      />

      {/* Main timeline */}
      <FeedTimeline
        posts={recentPosts || []}
        communities={recommendations.slice(0, 3)}
        rooms={activeRooms || []}
      />

      {/* FAB */}
      <FloatingActionButton />
    </div>
  )
}
