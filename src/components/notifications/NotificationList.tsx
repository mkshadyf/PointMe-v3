import { useNotifications } from '@/hooks/useNotifications'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Icons } from '@/components/ui/icons'

export function NotificationList() {
  const {
    notifications,
    error,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <Icons.spinner className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[300px] text-destructive">
        <p>Failed to load notifications</p>
      </div>
    )
  }

  if (!notifications?.length) {
    return (
      <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
        <Icons.bell className="h-8 w-8 mb-2" />
        <p>No notifications</p>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Notifications</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => markAllAsRead()}
          >
            Mark all as read
          </Button>
        </div>
        <CardDescription>
          Stay updated with your latest notifications
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`flex items-start gap-4 p-4 rounded-lg ${
                  notification.read ? 'bg-muted/50' : 'bg-muted'
                }`}
              >
                <div className="flex-shrink-0">
                  {notification.type === 'info' && (
                    <Icons.info className="h-5 w-5 text-blue-500" />
                  )}
                  {notification.type === 'success' && (
                    <Icons.checkCircle className="h-5 w-5 text-green-500" />
                  )}
                  {notification.type === 'warning' && (
                    <Icons.alertTriangle className="h-5 w-5 text-yellow-500" />
                  )}
                  {notification.type === 'error' && (
                    <Icons.alertCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
                <div className="flex-grow">
                  <p className="text-sm">{notification.message}</p>
                  <span className="text-xs text-muted-foreground mt-1 block">
                    {new Date(notification.created_at).toLocaleString()}
                  </span>
                </div>
                <div className="flex gap-2">
                  {!notification.read && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => markAsRead(notification.id)}
                    >
                      <Icons.check className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteNotification(notification.id)}
                  >
                    <Icons.trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="justify-end">
        <Button variant="outline" size="sm">
          View All
        </Button>
      </CardFooter>
    </Card>
  )
}
