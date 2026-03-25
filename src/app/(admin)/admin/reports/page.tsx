import { getCurrentUser } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ROUTES } from '@/constants/routes'
import { PageHeader } from '@/components/layout/page-header'
import { ReportTable } from '@/components/admin/report-table'

export default async function ReportsPage() {
  const user = await getCurrentUser()
  if (!user || user.role !== 'admin') redirect(ROUTES.LOGIN)

  const supabase = await createClient()
  const { data: reports } = await supabase
    .from('reports')
    .select('*, users:reporter_id(display_name)')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <PageHeader title="通報管理" />
      <ReportTable reports={reports || []} />
    </div>
  )
}
