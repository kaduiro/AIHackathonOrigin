import { getCurrentUser } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ROUTES } from '@/constants/routes'
import { PageHeader } from '@/components/layout/page-header'
import { ReviewQueue } from '@/components/admin/review-queue'

export default async function VerificationsPage() {
  const user = await getCurrentUser()
  if (!user || user.role !== 'admin') redirect(ROUTES.LOGIN)

  const supabase = await createClient()
  const { data: verifications } = await supabase
    .from('verifications')
    .select('*')
    .order('submitted_at', { ascending: true })

  return (
    <div className="space-y-6">
      <PageHeader title="年齢確認審査" />
      <ReviewQueue items={verifications || []} type="verification" />
    </div>
  )
}
