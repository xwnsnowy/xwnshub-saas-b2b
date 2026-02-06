'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { usePresence } from '@/hooks/use-presence';
import { getAvatar } from '@/lib/get-avatar';
import { orpc } from '@/lib/orpc';
import { cn } from '@/lib/utils';
import { User } from '@/schemas/realtime';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useMemo } from 'react';

export function MemberList() {
  const {
    data: { members },
  } = useSuspenseQuery(orpc.channel.list.queryOptions());

  const { data: workspaces } = useQuery(orpc.workspace.list.queryOptions());

  const currentUser = useMemo(() => {
    if (!workspaces?.user) return null;

    return {
      id: workspaces.user.id,
      full_name: workspaces.user.given_name + ' ' + workspaces.user.family_name,
      email: workspaces.user.email,
      picture: workspaces.user.picture,
    } satisfies User;
  }, [workspaces?.user]);

  const params = useParams();
  const workspaceId = params.workspaceId as string;

  const { onlineUsers } = usePresence({
    room: `workspace-${workspaceId}`,
    currentUser: currentUser,
  });

  const onlineUserIds = useMemo(() => new Set(onlineUsers.map((user) => user.id)), [onlineUsers]);

  return (
    <div className="space-y-1 py-1">
      {members.map((member) => (
        <div
          key={member.id}
          className="relative group flex items-center px-2 py-1 text-sm font-mono font-medium rounded-md border text-muted-foreground  hover:bg-teal-700 transition-colors duration-200 cursor-pointer"
        >
          <div className="relative flex-shrink-0">
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

            {/* Online/offline status indicator */}
            <div
              className={cn(
                'absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-background',
                member.id && onlineUserIds.has(member.id) ? 'bg-violet-500' : 'bg-gray-400',
              )}
            ></div>
          </div>
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
