import { useUnreadNotificationCount } from '@/hooks/useNotifications'
import { useUnreadMessageCount } from '@/hooks/useMessages'
import { Icons } from '@/components/ui/icons'

interface NotificationBadgeProps {
  type?: 'all' | 'messages' | 'notifications'
}

export function NotificationBadge({ type = 'all' }: NotificationBadgeProps) {
  const { unreadCount: unreadNotifications } = useUnreadNotificationCount()
  const { unreadCount: unreadMessages } = useUnreadMessageCount()

  const count = type === 'all'
    ? unreadNotifications + unreadMessages
    : type === 'messages'
    ? unreadMessages
    : unreadNotifications

  if (!count) return null

  return (
    <div className="relative">
      <Icons.bell className="h-6 w-6" />
      <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
        {count > 99 ? '99+' : count}
      </span>
    </div>
  )
}
