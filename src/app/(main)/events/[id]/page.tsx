import { notFound, redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'
import { ROUTES } from '@/constants/routes'
import { EventDetail } from '@/components/events/event-detail'

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user) redirect(ROUTES.LOGIN)

  const { id } = await params
  const supabase = await createClient()

  const { data: event } = await supabase
    .from('events')
    .select('*, users(display_name)')
    .eq('id', id)
    .single()

  if (!event) notFound()

  const { data: participation } = await supabase
    .from('event_participations')
    .select('*')
    .eq('event_id', id)
    .eq('user_id', user.id)
    .single()

  const { count: participantCount } = await supabase
    .from('event_participations')
    .select('*', { count: 'exact', head: true })
    .eq('event_id', id)
    .eq('status', 'registered')

  return (
    <div className="container max-w-2xl py-4">
      <EventDetail
        event={event}
        participation={participation}
        participantCount={participantCount || 0}
        userAgeGroup={user.age_group}
      />
    </div>
  )
}
