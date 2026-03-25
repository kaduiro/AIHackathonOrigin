import { getCurrentUser } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ROUTES } from '@/constants/routes'
import { PageHeader } from '@/components/layout/page-header'
import { EventMonitorTable } from '@/components/admin/event-monitor-table'

export default async function EventMonitoringPage() {
  const user = await getCurrentUser()
  if (!user || user.role !== 'admin') redirect(ROUTES.LOGIN)

  const supabase = await createClient()
  const { data: events } = await supabase
    .from('events')
    .select('*, users:creator_id(display_name)')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <PageHeader title="イベント監視" />
      <EventMonitorTable events={events || []} />
    </div>
  )
}
