import Link from 'next/link'
import { ROUTES } from '@/constants/routes'

interface EventStoriesProps {
  events: any[]
}

export function EventStories({ events }: EventStoriesProps) {
  if (events.length === 0) return null

  return (
    <div className="mb-4 -mx-4 px-4">
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
        {events.map((event) => {
          const startDate = new Date(event.start_at)
          const isToday = new Date().toDateString() === startDate.toDateString()
          const isSoon = startDate.getTime() - Date.now() < 3 * 60 * 60 * 1000

          return (
            <Link
              key={event.id}
              href={ROUTES.EVENT_DETAIL(event.id)}
              className="flex-shrink-0 w-20 text-center group"
            >
              <div className={`relative mx-auto h-16 w-16 rounded-full p-[2px] ${
                isSoon
                  ? 'bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500'
                  : isToday
                    ? 'bg-gradient-to-tr from-blue-500 to-purple-500'
                    : 'bg-gradient-to-tr from-gray-300 to-gray-400'
              }`}>
                <div className="flex h-full w-full items-center justify-center rounded-full bg-background text-lg">
                  {event.title.match(/[\p{Emoji}]/u)?.[0] || '📅'}
                </div>
              </div>
              <p className="mt-1 text-[10px] text-muted-foreground leading-tight line-clamp-2 group-hover:text-foreground transition-colors">
                {isSoon ? '🔴 まもなく' : isToday ? '今日' : startDate.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
              </p>
              <p className="text-[10px] font-medium leading-tight line-clamp-1">
                {event.title.replace(/[\p{Emoji}]/gu, '').trim().slice(0, 8)}
              </p>
            </Link>
          )
        })}
        <Link href={ROUTES.EVENTS} className="flex-shrink-0 w-20 text-center group">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-muted-foreground/30 group-hover:border-primary transition-colors">
            <span className="text-xl text-muted-foreground group-hover:text-primary">+</span>
          </div>
          <p className="mt-1 text-[10px] text-muted-foreground">すべて見る</p>
        </Link>
      </div>
    </div>
  )
}
