import { getCurrentUser } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import { ROUTES } from '@/constants/routes'
import { PageHeader } from '@/components/layout/page-header'
import { QAForm } from '@/components/qa/qa-form'

export default async function QACreatePage() {
  const user = await getCurrentUser()
  if (!user) redirect(ROUTES.LOGIN)

  return (
    <div className="container max-w-2xl space-y-4 py-4">
      <PageHeader
        title="質問を投稿"
        description="テンプレートに沿って入力すると、回答がもらいやすくなります"
      />
      <QAForm />
    </div>
  )
}
