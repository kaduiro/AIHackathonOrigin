import { notFound, redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'
import { ROUTES } from '@/constants/routes'
import { MentorDetail } from '@/components/mentors/mentor-detail'
import { BookingSection } from '@/components/mentors/booking-section'

export default async function MentorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user) redirect(ROUTES.LOGIN)

  const { id } = await params
  const supabase = await createClient()

  const { data: mentor } = await supabase
    .from('mentor_profiles')
    .select('*, users(id, display_name, avatar_url, bio)')
    .eq('user_id', id)
    .eq('status', 'approved')
    .single()

  if (!mentor) notFound()

  // Get available slots
  const { data: slots } = await supabase
    .from('booking_slots')
    .select('*')
    .eq('mentor_user_id', id)
    .eq('status', 'available')
    .gte('start_at', new Date().toISOString())
    .order('start_at')

  const isSelf = user.id === id

  return (
    <div className="container max-w-2xl space-y-6 py-4">
      <MentorDetail mentor={mentor} />
      {!isSelf && (
        <BookingSection
          mentorUserId={id}
          slots={slots || []}
        />
      )}
    </div>
  )
}
