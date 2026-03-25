import Link from 'next/link'
import { getCurrentUser } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ROUTES } from '@/constants/routes'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { QACard } from '@/components/qa/qa-card'
import { EmptyState } from '@/components/shared/empty-state'
import { Plus, HelpCircle } from 'lucide-react'

export default async function QAListPage() {
  const user = await getCurrentUser()
  if (!user) redirect(ROUTES.LOGIN)

  const supabase = await createClient()
  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .eq('status', 'published')
    .is('room_id', null)
    .order('created_at', { ascending: false })
    .limit(20)

  return (
    <div className="container max-w-3xl space-y-4 py-4">
      <PageHeader title="Q&A" description="質問を投稿して、みんなの知恵を借りよう">
        <Link href={ROUTES.QA_CREATE}>
          <Button size="sm"><Plus className="mr-1 h-4 w-4" />質問する</Button>
        </Link>
      </PageHeader>

      {(!posts || posts.length === 0) ? (
        <EmptyState
          icon={<HelpCircle className="h-12 w-12" />}
          title="まだ投稿がありません"
          description="最初の質問を投稿してみましょう！"
          action={
            <Link href={ROUTES.QA_CREATE}>
              <Button>質問を投稿する</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {posts.map((post: any) => (
            <QACard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  )
}
