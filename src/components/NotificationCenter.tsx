import React, { useState } from 'react'
import { Badge, IconButton, Popover, List, ListItem, ListItemText, Typography, Box } from '@mui/material'
import { Notifications as NotificationsIcon } from '@mui/icons-material'
import { trpc } from '../utils/trpc'

const NotificationCenter: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)

  const notificationsQuery = trpc.notification.getUserNotifications.useQuery()
  const markAsReadMutation = trpc.notification.markNotificationAsRead.useMutation()

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleMarkAsRead = async (notificationId: string) => {
    await markAsReadMutation.mutateAsync(notificationId)
    notificationsQuery.refetch()
  }

  const open = Boolean(anchorEl)
  const unreadCount = notificationsQuery.data?.filter(n => !n.read).length || 0

  return (
    <>
      <IconButton color="inherit" onClick={handleClick}>
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Popover
        open={open}
        anchorEl={anchorEl}
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
        <Box sx={{ width: 300, maxHeight: 400, overflow: 'auto' }}>
          <List>
            {notificationsQuery.data?.map((notification) => (
              <ListItem
                key={notification.id}
                onClick={() => handleMarkAsRead(notification.id)}
                sx={{ cursor: 'pointer', bgcolor: notification.read ? 'transparent' : 'action.hover' }}
              >
                <ListItemText
                  primary={notification.message}
                  secondary={
                    <Typography variant="caption" color="text.secondary">
                      {new Date(notification.createdAt).toLocaleString()}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
          {notificationsQuery.data?.length === 0 && (
            <Typography sx={{ p: 2 }}>No notifications</Typography>
          )}
        </Box>
      </Popover>
    </>
  )
}

export default NotificationCenter

