'use client'

import { useState, useTransition } from 'react'
import { addNGWordAction, removeNGWordAction } from '@/actions/admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Plus, X } from 'lucide-react'

interface NGWordEditorProps {
  words: any[] // eslint-disable-line @typescript-eslint/no-explicit-any
}

export function NGWordEditor({ words }: NGWordEditorProps) {
  const [newWord, setNewWord] = useState('')
  const [isPending, startTransition] = useTransition()

  const handleAdd = () => {
    if (!newWord.trim()) return
    startTransition(async () => {
      await addNGWordAction(newWord.trim(), 'general')
      setNewWord('')
    })
  }

  const handleRemove = (wordId: string) => {
    startTransition(async () => {
      await removeNGWordAction(wordId)
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          value={newWord}
          onChange={e => setNewWord(e.target.value)}
          placeholder="NGワードを追加"
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
        />
        <Button onClick={handleAdd} disabled={isPending || !newWord.trim()} size="sm">
          <Plus className="mr-1 h-4 w-4" />
          追加
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {words.map((word: any) => ( // eslint-disable-line @typescript-eslint/no-explicit-any
          <Badge key={word.id} variant="secondary" className="gap-1 pr-1">
            {word.word}
            <button
              onClick={() => handleRemove(word.id)}
              disabled={isPending}
              className="ml-1 hover:text-destructive"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
    </div>
  )
}
