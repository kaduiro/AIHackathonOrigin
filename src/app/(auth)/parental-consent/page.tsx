import { ParentalConsentForm } from '@/components/auth/parental-consent-form'
import { getCurrentUser } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import { ROUTES } from '@/constants/routes'

export default async function ParentalConsentPage() {
  const user = await getCurrentUser()
  if (!user) redirect(ROUTES.LOGIN)

  // Not a minor or already consented
  if (user.age_group !== 'minor') {
    redirect(ROUTES.AGE_VERIFICATION)
  }
  if (user.consent_status === 'submitted' || user.consent_status === 'approved') {
    redirect(ROUTES.FEED)
  }

  return (
    <>
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">保護者同意</h1>
        <p className="text-sm text-muted-foreground">
          18歳未満の方は、保護者の同意が必要です
        </p>
      </div>
      <ParentalConsentForm />
    </>
  )
}
