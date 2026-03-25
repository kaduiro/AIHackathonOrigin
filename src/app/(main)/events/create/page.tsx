import { getCurrentUser } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import { ROUTES } from '@/constants/routes'
import { PageHeader } from '@/components/layout/page-header'
import { EventForm } from '@/components/events/event-form'

export default async function EventCreatePage() {
  const user = await getCurrentUser()
  if (!user) redirect(ROUTES.LOGIN)
  if (!['verified', 'mentor', 'admin'].includes(user.role)) redirect(ROUTES.EVENTS)

  return (
    <div className="container max-w-2xl space-y-4 py-4">
      <PageHeader title="イベント作成" description="コミュニティのためのイベントを企画しましょう" />
      <EventForm />
    </div>
  )
}
