import { MessageItem } from './message/MessageItem';

const messages = [
  {
    id: 1,
    message: 'Hello, how are you?',
    date: new Date(),
    avatar: 'https://avatars.githubusercontent.com/u/109363894?s=96&v=4',
    userName: 'JohnDoe',
  },
  {
    id: 2,
    message: 'I am fine, thank you!',
    date: new Date(),
    avatar: 'https://avatars.githubusercontent.com/u/109363894?s=96&v=4',
    userName: 'JaneSmith',
  },
  {
    id: 3,
    message: 'What about you?',
    date: new Date(),
    avatar: 'https://avatars.githubusercontent.com/u/109363894?s=96&v=4',
    userName: 'ABC',
  },
];

export function MessagesList() {
  return (
    <div className="relive w-full">
      <div className="h-full overflow-y-auto px-4">
        {messages.map((message) => (
          <MessageItem key={message.id} {...message} />
        ))}
      </div>
    </div>
  );
}
