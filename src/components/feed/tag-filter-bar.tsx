'use client'

import { useState } from 'react'
import type { Tag } from '@/types/database'
import { cn } from '@/lib/utils'

interface TagFilterBarProps {
  tags: Tag[]
  userTagIds: string[]
}

export function TagFilterBar({ tags, userTagIds }: TagFilterBarProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>(userTagIds)

  // Show user's tags first, then others
  const sortedTags = [...tags].sort((a, b) => {
    const aIsUser = userTagIds.includes(a.id) ? -1 : 0
    const bIsUser = userTagIds.includes(b.id) ? -1 : 0
    return aIsUser - bIsUser
  })

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    )
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
      {sortedTags.slice(0, 15).map((tag) => (
        <button
          key={tag.id}
          onClick={() => toggleTag(tag.id)}
          className={cn(
            'inline-flex shrink-0 items-center rounded-full border px-3 py-1 text-xs font-medium transition-colors',
            selectedTags.includes(tag.id)
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-border bg-background text-muted-foreground hover:bg-muted'
          )}
        >
          {tag.name}
        </button>
      ))}
    </div>
  )
}
