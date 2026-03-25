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

  // Fetch posts and their authors separately to avoid FK ambiguity
  const { data: recentPosts } = await supabase
    .from('posts')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(20)

  // Enrich posts with author info
  const enrichedPosts = await Promise.all(
    (recentPosts || []).map(async (post) => {
      const { data: author } = await supabase
        .from('users')
        .select('id, display_name, avatar_url')
        .eq('id', post.author_id)
        .single()
      return { ...post, users: author }
    })
  )

  const { data: upcomingEvents } = await supabase
    .from('events')
    .select('*')
    .eq('status', 'published')
    .gte('start_at', new Date().toISOString())
    .order('start_at')
    .limit(10)

  // Enrich events with creator info
  const enrichedEvents = await Promise.all(
    (upcomingEvents || []).map(async (event) => {
      const { data: creator } = await supabase
        .from('users')
        .select('display_name')
        .eq('id', event.creator_id)
        .single()
      return { ...event, users: creator }
    })
  )

  const { data: activeRooms } = await supabase
    .from('rooms')
    .select('*')
    .eq('approval_status', 'approved')
    .order('created_at', { ascending: false })
    .limit(6)

  // Enrich rooms with community info
  const enrichedRooms = await Promise.all(
    (activeRooms || []).map(async (room) => {
      const { data: community } = await supabase
        .from('communities')
        .select('name')
        .eq('id', room.community_id)
        .single()
      return { ...room, communities: community }
    })
  )

  return (
    <div className="mx-auto max-w-2xl px-4 pb-20">
      {/* YOUTRUST-style status */}
      <StatusBadge user={user} />

      {/* Instagram stories-like events */}
      <EventStories events={enrichedEvents} />

      {/* Tag filter */}
      <TagFilterBar
        tags={allTags || []}
        userTagIds={(userTags || []).map((ut: any) => ut.tag_id)}
      />

      {/* Main timeline */}
      <FeedTimeline
        posts={enrichedPosts}
        communities={recommendations.slice(0, 3)}
        rooms={enrichedRooms}
      />

      {/* FAB */}
      <FloatingActionButton />
    </div>
  )
}
