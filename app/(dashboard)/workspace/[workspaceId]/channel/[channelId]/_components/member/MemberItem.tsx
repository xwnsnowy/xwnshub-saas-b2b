import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { RoleBadge } from '@/components/ui/role-badge';
import { getAvatar } from '@/lib/get-avatar';
import { organization_user } from '@kinde/management-api-js';
import Image from 'next/image';

interface MemberItemProps {
  member: organization_user;
}

export function MemberItem({ member }: MemberItemProps) {
  return (
    <div className="flex items-center justify-between p-3 hover:bg-accent cursor-pointer transition-colors">
      <div className="flex items-center space-x-3">
        <div>
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
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-center space-x-2">
            <p className="font-medium text-sm truncate">{member.full_name}</p>
            <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-600 ring-1 ring-inset ring-blue-700/10 dark:bg-blue-400/10 dark:text-blue-400 dark:ring-blue-400/30">
              Admin
            </span>
          </div>

          <RoleBadge role="admin" />
        </div>
      </div>
    </div>
  );
}
