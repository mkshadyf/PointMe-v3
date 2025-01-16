export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: Date;
  read: boolean;
}

export interface CreateMessageInput {
  receiverId: string;
  content: string;
}

