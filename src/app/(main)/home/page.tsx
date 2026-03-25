import { getCurrentUser } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import { ROUTES } from '@/constants/routes'
import { createClient } from '@/lib/supabase/server'
import { getMatchingCommunities } from '@/services/matching'
import { PageHeader } from '@/components/layout/page-header'
import { CommunitySection } from '@/components/feed/community-section'
import { FeedSection } from '@/components/feed/feed-section'
import { TagFilterBar } from '@/components/feed/tag-filter-bar'
import { SafetyBanner } from '@/components/feed/safety-banner'

export default async function HomePage() {
  const user = await getCurrentUser()
  if (!user) redirect(ROUTES.LOGIN)

  const supabase = await createClient()

  // Get recommended communities
  const recommendations = await getMatchingCommunities(user.id)

  // Get user's tags for filter
  const { data: userTags } = await supabase
    .from('user_tags')
    .select('tag_id, tags(id, name, category)')
    .eq('user_id', user.id)

  // Get all tags for filter bar
  const { data: allTags } = await supabase
    .from('tags')
    .select('*')
    .order('display_order')

  // Get recent posts (Q&A feed)
  const { data: recentPosts } = await supabase
    .from('posts')
    .select('*, users(display_name, avatar_url)')
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(10)

  // Get upcoming events
  const { data: upcomingEvents } = await supabase
    .from('events')
    .select('*, users(display_name)')
    .eq('status', 'published')
    .gte('start_at', new Date().toISOString())
    .order('start_at')
    .limit(5)

  return (
    <div className="container max-w-4xl space-y-6 py-4">
      <PageHeader
        title={`おかえりなさい、${user.display_name}さん`}
        description="あなたにおすすめのコミュニティやコンテンツ"
      />

      <SafetyBanner />

      {/* Recommended Communities */}
      <CommunitySection
        title="おすすめのコミュニティ"
        communities={recommendations.slice(0, 4)}
      />

      {/* Tag Filter */}
      <TagFilterBar
        tags={allTags || []}
        userTagIds={(userTags || []).map((ut: any) => ut.tag_id)}
      />

      {/* Recent Q&A */}
      <FeedSection
        title="最新のQ&A"
        posts={recentPosts || []}
        emptyMessage="まだ投稿がありません。最初の質問を投稿してみましょう！"
      />

      {/* Upcoming Events */}
      {upcomingEvents && upcomingEvents.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">今後のイベント</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {upcomingEvents.map((event: any) => (
              <a
                key={event.id}
                href={ROUTES.EVENT_DETAIL(event.id)}
                className="rounded-lg border p-4 transition-colors hover:bg-muted/50"
              >
                <h3 className="font-medium">{event.title}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                  {event.description}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {new Date(event.start_at).toLocaleDateString('ja-JP', {
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
