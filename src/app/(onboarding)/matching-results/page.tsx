import { getCurrentUser } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import { ROUTES } from '@/constants/routes'
import { getMatchingCommunities } from '@/services/matching'
import { MatchingResultsView } from '@/components/onboarding/matching-results-view'

export default async function MatchingResultsPage() {
  const user = await getCurrentUser()
  if (!user) redirect(ROUTES.LOGIN)

  const results = await getMatchingCommunities(user.id)

  return (
    <>
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">あなたにおすすめのコミュニティ</h1>
        <p className="text-sm text-muted-foreground">
          あなたの興味・診断結果にマッチするコミュニティが見つかりました
        </p>
      </div>
      <MatchingResultsView results={results} />
    </>
  )
}
