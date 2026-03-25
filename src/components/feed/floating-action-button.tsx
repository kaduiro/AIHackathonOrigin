'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, HelpCircle, Calendar, X } from 'lucide-react'
import { ROUTES } from '@/constants/routes'
import { cn } from '@/lib/utils'

export function FloatingActionButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="fixed bottom-20 right-4 z-40 flex flex-col-reverse items-end gap-2 md:bottom-6 md:right-6">
      {isOpen && (
        <div className="flex flex-col-reverse gap-2 mb-2 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <Link
            href={ROUTES.QA_CREATE}
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 rounded-full bg-blue-500 px-4 py-2.5 text-sm font-medium text-white shadow-lg hover:bg-blue-600 transition-colors"
          >
            <HelpCircle className="h-4 w-4" />
            質問する
          </Link>
          <Link
            href={ROUTES.EVENT_CREATE}
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 rounded-full bg-purple-500 px-4 py-2.5 text-sm font-medium text-white shadow-lg hover:bg-purple-600 transition-colors"
          >
            <Calendar className="h-4 w-4" />
            イベント作成
          </Link>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all',
          isOpen
            ? 'bg-muted-foreground text-background rotate-45'
            : 'bg-primary text-primary-foreground hover:bg-primary/90'
        )}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
      </button>
    </div>
  )
}
