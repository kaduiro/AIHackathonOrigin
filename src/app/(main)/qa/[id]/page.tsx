import { notFound, redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'
import { ROUTES } from '@/constants/routes'
import { QADetail } from '@/components/qa/qa-detail'
import { CommentList } from '@/components/qa/comment-list'
import { CommentForm } from '@/components/qa/comment-form'

export default async function QADetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user) redirect(ROUTES.LOGIN)

  const { id } = await params
  const supabase = await createClient()

  const { data: post } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single()

  if (!post || (post.status !== 'published' && post.author_id !== user.id)) {
    notFound()
  }

  const { data: comments } = await supabase
    .from('comments')
    .select('*')
    .eq('post_id', id)
    .eq('status', 'published')
    .order('created_at')

  const { data: reactions } = await supabase
    .from('reactions')
    .select('*')
    .eq('target_type', 'post')
    .eq('target_id', id)

  const userReactions = (reactions || [])
    .filter((r: any) => r.user_id === user.id)
    .map((r: any) => r.reaction_type)

  return (
    <div className="container max-w-3xl space-y-6 py-4">
      <QADetail
        post={post}
        reactionCount={(reactions || []).length}
        userReactions={userReactions}
        isAuthor={post.author_id === user.id}
      />
      <CommentList comments={comments || []} postId={id} userId={user.id} />
      <CommentForm postId={id} />
    </div>
  )
}
