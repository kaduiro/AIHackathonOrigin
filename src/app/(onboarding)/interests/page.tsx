import { createClient } from '@/lib/supabase/server'
import { TagSelectionForm } from '@/components/onboarding/tag-selection-form'
import { getCurrentUser } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import { ROUTES } from '@/constants/routes'

export default async function InterestsPage() {
  const user = await getCurrentUser()
  if (!user) redirect(ROUTES.LOGIN)

  const supabase = await createClient()

  // Fetch all tags grouped by category
  const { data: tags } = await supabase
    .from('tags')
    .select('*')
    .order('display_order')

  // Fetch user's existing tags
  const { data: userTags } = await supabase
    .from('user_tags')
    .select('tag_id')
    .eq('user_id', user.id)

  const selectedTagIds = (userTags || []).map(ut => ut.tag_id)

  return (
    <>
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">興味のあるジャンルを選んでください</h1>
        <p className="text-sm text-muted-foreground">
          あなたにぴったりのコミュニティをおすすめするために使います（最大10個）
        </p>
      </div>
      <TagSelectionForm
        tags={tags || []}
        initialSelected={selectedTagIds}
      />
    </>
  )
}
