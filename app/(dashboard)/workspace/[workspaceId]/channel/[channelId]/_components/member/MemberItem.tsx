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
    <div className="flex items-center justify-center p-3 hover:bg-accent cursor-pointer transition-colors space-x-4">
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
      <div className="flex flex-1 items-center justify-between">
        <div className="flex flex-col min-w-0">
          <p className="font-medium text-sm truncate">{member.full_name}</p>
          <p className="text-xs">{member.email}</p>
        </div>

        <RoleBadge role="admin" />
      </div>
    </div>
  );
}
