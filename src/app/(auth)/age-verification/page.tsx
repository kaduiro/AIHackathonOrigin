import { AgeVerificationForm } from '@/components/auth/age-verification-form'
import { getCurrentUser } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import { ROUTES } from '@/constants/routes'

export default async function AgeVerificationPage() {
  const user = await getCurrentUser()
  if (!user) redirect(ROUTES.LOGIN)

  // Already verified
  if (user.age_group !== 'unverified') {
    if (user.age_group === 'minor' && user.consent_status !== 'approved' && user.consent_status !== 'submitted') {
      redirect(ROUTES.PARENTAL_CONSENT)
    }
    redirect(ROUTES.FEED)
  }

  return (
    <>
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">年齢確認</h1>
        <p className="text-sm text-muted-foreground">
          安全なコミュニティ体験のために、年齢の確認をお願いします
        </p>
      </div>
      <AgeVerificationForm />
    </>
  )
}
