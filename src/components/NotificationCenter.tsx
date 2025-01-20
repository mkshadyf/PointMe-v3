import { useState } from 'react'
import { trpc } from '../utils/trpc'
import { Notification } from '../types'
import {
  Badge,
  IconButton,
  Menu,
  MenuItem,
  ListItemText,
  Typography
} from '@mui/material'
import { Notifications as NotificationsIcon } from '@mui/icons-material'

export default function NotificationCenter() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)
  
  const { data: notifications } = trpc.notification.list.useQuery({
    cursor: 0,
    limit: 20,
    unreadOnly: false
  })
  const markAsReadMutation = trpc.notification.markAsRead.useMutation()
  
  const unreadCount = notifications?.items.filter(
    (notification: Notification) => !notification.read
  ).length

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleMarkAsRead = (notificationId: string) => {
    markAsReadMutation.mutate(notificationId)
  }

  const formatNotificationTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - new Date(date).getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days} days ago`
    if (hours > 0) return `${hours} hours ago`
    if (minutes > 0) return `${minutes} minutes ago`
    return 'Just now'
  }

  return (
    <div>
      <IconButton onClick={handleClick}>
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        {notifications?.total === 0 ? (
          <MenuItem>
            <Typography>No notifications</Typography>
          </MenuItem>
        ) : (
          notifications?.items.map((notification: Notification) => (
            <MenuItem
              key={notification.id}
              onClick={() => handleMarkAsRead(notification.id)}
              sx={{ opacity: notification.read ? 0.6 : 1 }}
            >
              <ListItemText
                primary={notification.content}
                secondary={formatNotificationTime(notification.createdAt)}
              />
            </MenuItem>
          ))
        )}
      </Menu>
    </div>
  )
}
