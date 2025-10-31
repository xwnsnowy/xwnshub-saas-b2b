import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Image from 'next/image';

const memberList = [
  {
    id: '1',
    name: 'Alice Johnson',
    imageUrl: 'https://avatars.githubusercontent.com/u/109363894?s=96&v=4',
    email: 'alice@xy.z',
  },
  {
    id: '2',
    name: 'Bob Smith',
    imageUrl: 'https://avatars.githubusercontent.com/u/109363894?s=96&v=4',
    email: 'alice@xy.z',
  },
  {
    id: '3',
    name: 'Charlie Brown',
    imageUrl: 'https://avatars.githubusercontent.com/u/109363894?s=96&v=4',
    email: 'alice@xy.z',
  },
];

export function MemberList() {
  return (
    <div className="space-y-1 py-1">
      {memberList.map((member) => (
        <div
          key={member.id}
          className="relative group flex items-center px-2 py-1 text-sm font-mono font-medium rounded-md border text-muted-foreground  hover:bg-teal-700 transition-colors duration-200 cursor-pointer"
        >
          <Avatar className="size-8 relative">
            <Image
              src={member.imageUrl}
              alt={member.name}
              fill
              className="object-cover rounded-full"
            />
            <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0 ml-2">
            <span className="truncate group-hover:text-foreground  transition-colors duration-200">
              {member.name}
            </span>
            <p className="truncate text-xs">{member.email}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
