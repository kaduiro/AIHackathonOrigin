'use client'

import { useState } from 'react'
import { User } from '@/types/database'
import { cn } from '@/lib/utils'

const STATUS_OPTIONS = [
  { emoji: '💬', label: '雑談したい', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
  { emoji: '📚', label: '勉強中', color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' },
  { emoji: '🔍', label: '仲間募集', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' },
  { emoji: '💼', label: 'インターン準備中', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300' },
  { emoji: '🎯', label: 'もくもく会したい', color: 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300' },
  { emoji: '🌱', label: 'はじめたばかり', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300' },
]

interface StatusBadgeProps {
  user: User
}

export function StatusBadge({ user }: StatusBadgeProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selected, setSelected] = useState<number | null>(null)

  const currentStatus = selected !== null ? STATUS_OPTIONS[selected] : null

  return (
    <div className="mb-4 pt-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors hover:bg-muted"
      >
        {currentStatus ? (
          <>
            <span>{currentStatus.emoji}</span>
            <span className="font-medium">{user.display_name}</span>
            <span className={cn('rounded-full px-2 py-0.5 text-xs', currentStatus.color)}>
              {currentStatus.label}
            </span>
          </>
        ) : (
          <>
            <span className="text-muted-foreground">👋</span>
            <span className="font-medium">{user.display_name}</span>
            <span className="text-xs text-muted-foreground">ステータスを設定</span>
          </>
        )}
      </button>

      {isOpen && (
        <div className="mt-2 flex flex-wrap gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          {STATUS_OPTIONS.map((status, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSelected(idx === selected ? null : idx)
                setIsOpen(false)
              }}
              className={cn(
                'flex items-center gap-1 rounded-full border px-3 py-1 text-xs transition-all hover:scale-105',
                idx === selected ? status.color + ' border-transparent' : 'hover:bg-muted'
              )}
            >
              <span>{status.emoji}</span>
              <span>{status.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
