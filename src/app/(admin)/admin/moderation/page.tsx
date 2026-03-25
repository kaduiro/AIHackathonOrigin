import { getCurrentUser } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ROUTES } from '@/constants/routes'
import { PageHeader } from '@/components/layout/page-header'
import { ModerationQueue } from '@/components/admin/moderation-queue'
import { NGWordEditor } from '@/components/admin/ng-word-editor'

export default async function ModerationPage() {
  const user = await getCurrentUser()
  if (!user || user.role !== 'admin') redirect(ROUTES.LOGIN)

  const supabase = await createClient()
  const [cases, ngWords] = await Promise.all([
    supabase.from('moderation_cases').select('*').eq('review_status', 'pending').order('created_at'),
    supabase.from('ng_words').select('*').eq('is_active', true).order('created_at'),
  ])

  return (
    <div className="space-y-8">
      <PageHeader title="モデレーション設定" />
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">保留コンテンツ</h2>
        <ModerationQueue cases={cases.data || []} />
      </section>
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">NGワード管理</h2>
        <NGWordEditor words={ngWords.data || []} />
      </section>
    </div>
  )
}
