import { getCurrentUser } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import { ROUTES } from '@/constants/routes'
import { ChatWindow } from '@/components/ai/chat-window'
import { PageHeader } from '@/components/layout/page-header'

export default async function AISupportPage() {
  const user = await getCurrentUser()
  if (!user) redirect(ROUTES.LOGIN)

  return (
    <div className="container max-w-2xl py-4">
      <PageHeader
        title="AIサポート"
        description="タグの選び方、質問の書き方など、何でもお気軽にどうぞ"
      />
      <ChatWindow />
    </div>
  )
}
