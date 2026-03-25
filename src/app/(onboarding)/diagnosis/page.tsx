import { DiagnosisWizard } from '@/components/onboarding/diagnosis-wizard'
import { getCurrentUser } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import { ROUTES } from '@/constants/routes'

export default async function DiagnosisPage() {
  const user = await getCurrentUser()
  if (!user) redirect(ROUTES.LOGIN)

  return (
    <>
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">自己診断</h1>
        <p className="text-sm text-muted-foreground">
          いくつかの質問に答えて、あなたに最適なコミュニティを見つけましょう
        </p>
      </div>
      <DiagnosisWizard />
    </>
  )
}
