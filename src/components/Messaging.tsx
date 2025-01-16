import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, TextField, Button, List, ListItem, ListItemText, Paper } from '@mui/material';
import { trpc } from '../utils/trpc';
import { useAuthStore } from '../stores/authStore';

const Messaging: React.FC = () => {
  const [selectedUser, setSelectedUser] = useState<{ id: string; name: string } | null>(null);
  const [messageContent, setMessageContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();

  const conversationsQuery = trpc.message.getConversations.useQuery();
  const messagesQuery = trpc.message.getMessages.useQuery(selectedUser?.id || '', {
    enabled: !!selectedUser,
  });
  const sendMessageMutation = trpc.message.sendMessage.useMutation();

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messagesQuery.data]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUser && messageContent.trim()) {
      await sendMessageMutation.mutateAsync({
        receiverId: selectedUser.id,
        content: messageContent.trim(),
      });
      setMessageContent('');
      messagesQuery.refetch();
    }
  };

  return (
    <Box display="flex" height="600px">
      <Paper elevation={3} sx={{ width: '30%', overflowY: 'auto', p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Conversations
        </Typography>
        <List>
          {conversationsQuery.data?.map((conversation) => (
            <ListItem
              key={conversation.userId}
              button
              onClick={() => setSelectedUser({ id: conversation.userId, name: conversation.userName })}
              selected={selectedUser?.id === conversation.userId}
            >
              <ListItemText
                primary={conversation.userName}
                secondary={conversation.lastMessage}
              />
            </ListItem>
          ))}
        </List>
      </Paper>
      <Box flex={1} display="flex" flexDirection="column" ml={2}>
        {selectedUser ? (
          <>
            <Typography variant="h6" gutterBottom>
              Chat with {selectedUser.name}
            </Typography>
            <Paper elevation={3} sx={{ flex: 1, overflowY: 'auto', p: 2, mb: 2 }}>
              {messagesQuery.data?.map((message) => (
                <Box
                  key={message.id}
                  alignSelf={message.senderId === user?.id ? 'flex-end' : 'flex-start'}
                  bgcolor={message.senderId === user?.id ? 'primary.light' : 'grey.200'}
                  color={message.senderId === user?.id ? 'primary.contrastText' : 'text.primary'}
                  p={1}
                  borderRadius={2}
                  mb={1}
                  maxWidth="70%"
                >
                  <Typography variant="body2">{message.content}</Typography>
                </Box>
              ))}
              <div ref={messagesEndRef} />
            </Paper>
            <Box component="form" onSubmit={handleSendMessage} display="flex">
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Type a message..."
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
              />
              <Button type="submit" variant="contained" sx={{ ml: 1 }}>
                Send
              </Button>
            </Box>
          </>
        ) : (
          <Typography variant="h6">Select a conversation to start chatting</Typography>
        )}
      </Box>
    </Box>
  );
};

export default Messaging;

