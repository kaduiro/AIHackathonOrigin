import { getCurrentUser } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ROUTES } from '@/constants/routes'
import { PageHeader } from '@/components/layout/page-header'
import { ReviewQueue } from '@/components/admin/review-queue'

export default async function MentorReviewPage() {
  const user = await getCurrentUser()
  if (!user || user.role !== 'admin') redirect(ROUTES.LOGIN)

  const supabase = await createClient()
  const { data: mentors } = await supabase
    .from('mentor_profiles')
    .select('*, users(display_name, email)')
    .order('created_at')

  return (
    <div className="space-y-6">
      <PageHeader title="メンター審査" />
      <ReviewQueue items={mentors || []} type="mentor" />
    </div>
  )
}
