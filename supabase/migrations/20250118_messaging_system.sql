-- Enable realtime features for the relevant tables
alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table notifications;

-- Enable row level security
alter table messages enable row level security;
alter table notifications enable row level security;

-- Create policies for messages
create policy "Users can view their own messages"
  on messages for select
  using (auth.uid() = sender_id or auth.uid() = receiver_id);

create policy "Users can send messages"
  on messages for insert
  with check (auth.uid() = sender_id);

create policy "Users can update their own received messages"
  on messages for update
  using (auth.uid() = receiver_id);

-- Create policies for notifications
create policy "Users can view their own notifications"
  on notifications for select
  using (auth.uid() = user_id);

create policy "System can create notifications"
  on notifications for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own notifications"
  on notifications for update
  using (auth.uid() = user_id);

create policy "Users can delete their own notifications"
  on notifications for delete
  using (auth.uid() = user_id);

-- Create function to notify on new message
create or replace function notify_new_message()
returns trigger
language plpgsql
security definer
as $$
begin
  perform pg_notify(
    'new_message',
    json_build_object(
      'id', new.id,
      'sender_id', new.sender_id,
      'receiver_id', new.receiver_id,
      'content', new.content,
      'created_at', new.created_at
    )::text
  );
  return new;
end;
$$;

-- Create trigger for new message notifications
create trigger on_new_message
  after insert on messages
  for each row
  execute function notify_new_message();

-- Create function to notify on new notification
create or replace function notify_new_notification()
returns trigger
language plpgsql
security definer
as $$
begin
  perform pg_notify(
    'new_notification',
    json_build_object(
      'id', new.id,
      'user_id', new.user_id,
      'message', new.message,
      'type', new.type,
      'created_at', new.created_at
    )::text
  );
  return new;
end;
$$;

-- Create trigger for new notification notifications
create trigger on_new_notification
  after insert on notifications
  for each row
  execute function notify_new_notification();
