'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { saveTagsAction } from '@/actions/onboarding'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { Tag } from '@/types/database'
import { ROUTES } from '@/constants/routes'
import { cn } from '@/lib/utils'

const categoryLabels: Record<string, string> = {
  interest: '興味・関心',
  skill: 'スキル',
  goal: '目標',
  field: '分野',
}

interface TagSelectionFormProps {
  tags: Tag[]
  initialSelected: string[]
}

export function TagSelectionForm({ tags, initialSelected }: TagSelectionFormProps) {
  const [selected, setSelected] = useState<string[]>(initialSelected)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const groupedTags = tags.reduce<Record<string, Tag[]>>((acc, tag) => {
    if (!acc[tag.category]) acc[tag.category] = []
    acc[tag.category].push(tag)
    return acc
  }, {})

  const toggleTag = (tagId: string) => {
    setSelected(prev => {
      if (prev.includes(tagId)) {
        return prev.filter(id => id !== tagId)
      }
      if (prev.length >= 10) return prev
      return [...prev, tagId]
    })
  }

  const handleSubmit = () => {
    if (selected.length === 0) {
      setError('少なくとも1つのタグを選択してください')
      return
    }
    setError(null)
    startTransition(async () => {
      const result = await saveTagsAction(selected)
      if (result.success) {
        router.push(ROUTES.DIAGNOSIS)
      } else {
        setError(result.error || 'エラーが発生しました')
      }
    })
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {Object.entries(groupedTags).map(([category, categoryTags]) => (
        <div key={category} className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground">
            {categoryLabels[category] || category}
          </h2>
          <div className="flex flex-wrap gap-2">
            {categoryTags.map(tag => (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggleTag(tag.id)}
                className={cn(
                  'inline-flex h-auto shrink-0 items-center justify-center gap-1 overflow-hidden rounded-4xl border px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors cursor-pointer',
                  selected.includes(tag.id)
                    ? 'border-transparent bg-primary text-primary-foreground'
                    : 'border-border text-foreground hover:bg-muted hover:text-muted-foreground'
                )}
              >
                {tag.name}
              </button>
            ))}
          </div>
        </div>
      ))}

      <p className="text-xs text-muted-foreground text-center">
        {selected.length}/10 選択中
      </p>

      <div className="flex gap-3">
        <Button
          onClick={handleSubmit}
          disabled={isPending || selected.length === 0}
          className="flex-1"
        >
          {isPending ? '保存中...' : '次へ進む'}
        </Button>
      </div>
    </div>
  )
}
