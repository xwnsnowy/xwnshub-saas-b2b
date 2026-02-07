import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { RoleBadge } from '@/components/ui/role-badge';
import { getAvatar } from '@/lib/get-avatar';
import { cn } from '@/lib/utils';
import { organization_user } from '@kinde/management-api-js';
import Image from 'next/image';

interface MemberItemProps {
  member: organization_user;
  isOnline?: boolean;
}

export function MemberItem({ member, isOnline }: MemberItemProps) {
  const isAdmin = member.roles?.includes('admin');
  return (
    <div className="flex items-center justify-center p-3 hover:bg-accent cursor-pointer transition-colors space-x-4">
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
        <div
          className={cn(
            'absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-background',
            isOnline ? 'bg-violet-500' : 'bg-gray-400',
          )}
        ></div>
      </div>
      <div className="flex flex-1 items-center justify-between">
        <div className="flex flex-col min-w-0">
          <p className="font-medium text-sm truncate">{member.full_name}</p>
          <p className="text-xs">{member.email}</p>
        </div>

        {isAdmin ? <RoleBadge role="Admin" isAdmin /> : <RoleBadge role="Member" />}
      </div>
    </div>
  );
}
