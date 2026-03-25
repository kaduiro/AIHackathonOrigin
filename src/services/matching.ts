import { createClient } from '@/lib/supabase/server'

export interface MatchResult {
  community: {
    id: string
    name: string
    description: string
    icon_url: string | null
  }
  matchScore: number
  matchedTags: string[]
}

export async function getMatchingCommunities(userId: string): Promise<MatchResult[]> {
  const supabase = await createClient()

  // Get user's selected tags
  const { data: userTags } = await supabase
    .from('user_tags')
    .select('tag_id, tags(id, name)')
    .eq('user_id', userId)

  if (!userTags || userTags.length === 0) {
    // Fallback: return all communities
    const { data: communities } = await supabase
      .from('communities')
      .select('*')
      .eq('visibility', 'public')
      .limit(8)

    return (communities || []).map(c => ({
      community: c,
      matchScore: 0,
      matchedTags: [],
    }))
  }

  const userTagIds = userTags.map(ut => ut.tag_id)
  const userTagNames = userTags.map(ut => (ut.tags as unknown as { id: string; name: string } | null)?.name).filter(Boolean) as string[]

  // Get communities with their tags
  const { data: communities } = await supabase
    .from('communities')
    .select(`
      id, name, description, icon_url,
      community_tags(tag_id, tags(id, name))
    `)
    .eq('visibility', 'public')

  if (!communities) return []

  // Calculate match scores
  const results: MatchResult[] = communities.map(community => {
    const communityTags = (community.community_tags || []) as unknown as Array<{ tag_id: string; tags: { id: string; name: string } | null }>
    const communityTagIds = communityTags.map(ct => ct.tag_id)
    const communityTagNames = communityTags.map(ct => ct.tags?.name).filter(Boolean) as string[]

    const matchedTagIds = communityTagIds.filter((id: string) => userTagIds.includes(id))
    const matchedTags = communityTagNames.filter((name: string) => userTagNames.includes(name))

    const matchScore = communityTagIds.length > 0
      ? matchedTagIds.length / communityTagIds.length
      : 0

    return {
      community: {
        id: community.id,
        name: community.name,
        description: community.description,
        icon_url: community.icon_url,
      },
      matchScore,
      matchedTags,
    }
  })

  // Sort by match score descending
  results.sort((a, b) => b.matchScore - a.matchScore)

  return results
}
