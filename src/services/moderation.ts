import { createClient } from '@/lib/supabase/server'
import { moderateContent, type ModerationResult } from '@/lib/ai/moderation'

export async function moderateAndRecord(
  targetType: string,
  targetId: string,
  content: string
): Promise<ModerationResult & { recorded: boolean }> {
  const result = moderateContent(content)
  const supabase = await createClient()

  // Record moderation case if not safe
  if (result.label !== 'safe') {
    await supabase.from('moderation_cases').insert({
      target_type: targetType,
      target_id: targetId,
      ai_label: result.label,
      review_status: 'pending',
      flagged_words: result.flaggedWords,
      reasons: result.reasons,
    })
  }

  return { ...result, recorded: result.label !== 'safe' }
}
