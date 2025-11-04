'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getAvatar } from '@/lib/get-avatar';
import { orpc } from '@/lib/orpc';
import { useSuspenseQuery } from '@tanstack/react-query';
import Image from 'next/image';

export function MemberList() {
  const {
    data: { members },
  } = useSuspenseQuery(orpc.channel.list.queryOptions());

  return (
    <div className="space-y-1 py-1">
      {members.map((member) => (
        <div
          key={member.id}
          className="relative group flex items-center px-2 py-1 text-sm font-mono font-medium rounded-md border text-muted-foreground  hover:bg-teal-700 transition-colors duration-200 cursor-pointer"
        >
          <Avatar className="size-8 relative">
            <Image
              src={getAvatar(member.picture, member.email)}
              alt="User Image"
              fill
              sizes="(max-width: 768px) 32px, 32px"
              className="object-cover rounded-full"
            />
            <AvatarFallback>{member.full_name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0 ml-2">
            <span className="truncate group-hover:text-foreground  transition-colors duration-200 font-sans">
              {member.full_name}
            </span>
            <p className="truncate text-xs">{member.email}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
