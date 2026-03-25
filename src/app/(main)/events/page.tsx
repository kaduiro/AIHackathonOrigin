import Link from 'next/link'
import { getCurrentUser } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ROUTES } from '@/constants/routes'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { EventCard } from '@/components/events/event-card'
import { EmptyState } from '@/components/shared/empty-state'
import { Plus, Calendar } from 'lucide-react'

export default async function EventListPage() {
  const user = await getCurrentUser()
  if (!user) redirect(ROUTES.LOGIN)

  const supabase = await createClient()
  const { data: events } = await supabase
    .from('events')
    .select('*')
    .eq('status', 'published')
    .gte('start_at', new Date().toISOString())
    .order('start_at')

  const canCreate = ['verified', 'mentor', 'admin'].includes(user.role)

  return (
    <div className="container max-w-3xl space-y-4 py-4">
      <PageHeader title="イベント" description="学びと交流のイベントに参加しよう">
        {canCreate && (
          <Link href={ROUTES.EVENT_CREATE}>
            <Button size="sm"><Plus className="mr-1 h-4 w-4" />イベント作成</Button>
          </Link>
        )}
      </PageHeader>

      {(!events || events.length === 0) ? (
        <EmptyState icon={<Calendar className="h-12 w-12" />} title="今後のイベントはありません" description="新しいイベントが作成されるとここに表示されます" />
      ) : (
        <div className="space-y-3">
          {events.map((event: any) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  )
}
