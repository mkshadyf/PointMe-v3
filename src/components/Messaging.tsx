import React, { useRef, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Box,
  TextField,
  Typography,
  Paper,
  List,
  ListItem,
  Avatar,
  IconButton,
  Stack,
} from '@mui/material'
import { Send as SendIcon } from '@mui/icons-material'
import { trpc } from '../utils/trpc'
import { Message, User } from '../types'

interface MessagingProps {
  otherUserId: string
}

interface ChatWindowProps {
  messages: Message[]
  currentUser: User
  onSendMessage: (content: string) => void
  isLoading?: boolean
}

const messageSchema = z.object({
  content: z.string().min(1, 'Message cannot be empty'),
})

type MessageFormData = z.infer<typeof messageSchema>

const ChatWindow: React.FC<ChatWindowProps> = ({
  messages,
  currentUser,
  onSendMessage,
  isLoading,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { register, handleSubmit, reset } = useForm<MessageFormData>({
    resolver: zodResolver(messageSchema),
  })

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const onSubmit = (data: MessageFormData) => {
    onSendMessage(data.content)
    reset()
  }

  return (
    <Paper elevation={3} sx={{ height: '600px', display: 'flex', flexDirection: 'column' }}>
      <List sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
        {messages.map((message) => (
          <ListItem
            key={message.id}
            sx={{
              display: 'flex',
              justifyContent: message.senderId === currentUser.id ? 'flex-end' : 'flex-start',
              mb: 2,
            }}
          >
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{
                maxWidth: '70%',
              }}
            >
              {message.senderId !== currentUser.id && (
                <Avatar src={message.sender.avatar} alt={message.sender.name} />
              )}
              <Paper
                elevation={1}
                sx={{
                  p: 2,
                  bgcolor: message.senderId === currentUser.id ? 'primary.main' : 'grey.100',
                  color: message.senderId === currentUser.id ? 'white' : 'text.primary',
                }}
              >
                <Typography variant="body1">{message.content}</Typography>
              </Paper>
            </Stack>
          </ListItem>
        ))}
        <div ref={messagesEndRef} />
      </List>
      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        sx={{
          p: 2,
          borderTop: 1,
          borderColor: 'divider',
          display: 'flex',
          gap: 1,
        }}
      >
        <TextField
          {...register('content')}
          fullWidth
          placeholder="Type a message..."
          variant="outlined"
          size="small"
        />
        <IconButton type="submit" color="primary" disabled={isLoading}>
          <SendIcon />
        </IconButton>
      </Box>
    </Paper>
  )
}

const Messaging: React.FC<MessagingProps> = ({ otherUserId }) => {
  const { data: messages, refetch } = trpc.message.list.useQuery({
    otherUserId,
    cursor: 0,
    limit: 50,
  })

  const { data: currentUser } = trpc.auth.me.useQuery()

  const sendMessageMutation = trpc.message.send.useMutation({
    onSuccess: () => {
      refetch()
    },
  })

  const handleSendMessage = (content: string) => {
    if (!currentUser) return

    sendMessageMutation.mutate({
      receiverId: otherUserId,
      content,
    })
  }

  if (!messages || !currentUser) {
    return <Typography>Loading...</Typography>
  }

  return (
    <ChatWindow
      messages={messages.items}
      currentUser={{
        ...currentUser,
        createdAt: new Date(currentUser.createdAt),
        updatedAt: new Date(currentUser.updatedAt),
      }}
      onSendMessage={handleSendMessage}
      isLoading={sendMessageMutation.isPending}
    />
  )
}

export default Messaging
