'use client'

import { useState } from 'react'
import type { Tag } from '@/types/database'
import { cn } from '@/lib/utils'

const TAG_COLORS = [
  'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-800',
  'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/50 dark:text-purple-300 dark:border-purple-800',
  'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-800',
  'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/50 dark:text-amber-300 dark:border-amber-800',
  'bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-900/50 dark:text-pink-300 dark:border-pink-800',
  'bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-900/50 dark:text-cyan-300 dark:border-cyan-800',
]

interface TagFilterBarProps {
  tags: Tag[]
  userTagIds: string[]
}

export function TagFilterBar({ tags, userTagIds }: TagFilterBarProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>(userTagIds)

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
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4">
      {sortedTags.slice(0, 20).map((tag, idx) => {
        const isSelected = selectedTags.includes(tag.id)
        const colorClass = TAG_COLORS[idx % TAG_COLORS.length]
        return (
          <button
            key={tag.id}
            onClick={() => toggleTag(tag.id)}
            className={cn(
              'inline-flex shrink-0 items-center rounded-full border px-3 py-1.5 text-xs font-medium transition-all',
              isSelected
                ? colorClass
                : 'border-border bg-background text-muted-foreground hover:bg-muted'
            )}
          >
            #{tag.name}
          </button>
        )
      })}
    </div>
  )
}
