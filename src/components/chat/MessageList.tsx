import { useEffect, useRef } from 'react'
import { useMessages } from '@/hooks/useMessages'
import { useAuth } from '@/contexts/AuthContext'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Icons } from '@/components/ui/icons'

interface MessageListProps {
  otherId: string
  otherName: string
  otherAvatar?: string
}

export function MessageList({ otherId, otherName, otherAvatar }: MessageListProps) {
  const { user } = useAuth()
  const { messages, error, isLoading } = useMessages(otherId)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Icons.spinner className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[400px] text-destructive">
        <p>Failed to load messages</p>
      </div>
    )
  }

  return (
    <ScrollArea className="h-[400px] pr-4">
      <div className="space-y-4">
        {messages?.map((message) => {
          const isOwn = message.sender_id === user?.id
          return (
            <div
              key={message.id}
              className={`flex items-start gap-2 ${
                isOwn ? 'flex-row-reverse' : ''
              }`}
            >
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={isOwn ? user?.avatar_url : otherAvatar}
                  alt={isOwn ? user?.name : otherName}
                />
                <AvatarFallback>
                  {(isOwn ? user?.name : otherName)?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div
                className={`rounded-lg px-4 py-2 max-w-[70%] ${
                  isOwn
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <span className="text-xs text-muted-foreground mt-1 block">
                  {new Date(message.created_at).toLocaleTimeString()}
                </span>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  )
}
