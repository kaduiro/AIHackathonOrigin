import { getCurrentUser } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ROUTES } from '@/constants/routes'
import { PageHeader } from '@/components/layout/page-header'
import { MentorCard } from '@/components/mentors/mentor-card'
import { EmptyState } from '@/components/shared/empty-state'
import { UserCheck } from 'lucide-react'

export default async function MentorListPage() {
  const user = await getCurrentUser()
  if (!user) redirect(ROUTES.LOGIN)

  const supabase = await createClient()
  const { data: mentors } = await supabase
    .from('mentor_profiles')
    .select('*')
    .eq('status', 'approved')

  return (
    <div className="container max-w-3xl space-y-4 py-4">
      <PageHeader title="メンター" description="認証済みメンターに相談しよう" />

      {(!mentors || mentors.length === 0) ? (
        <EmptyState icon={<UserCheck className="h-12 w-12" />} title="メンターがまだいません" description="認証済みメンターが登録されるとここに表示されます" />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {mentors.map((mentor: any) => (
            <MentorCard key={mentor.id} mentor={mentor} />
          ))}
        </div>
      )}
    </div>
  )
}
