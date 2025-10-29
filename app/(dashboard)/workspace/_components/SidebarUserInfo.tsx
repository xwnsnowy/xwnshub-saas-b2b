'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getAvatar } from '@/lib/get-avatar';
import { orpc } from '@/lib/orpc';
import { LogoutLink, PortalLink } from '@kinde-oss/kinde-auth-nextjs/components';
import { useSuspenseQuery } from '@tanstack/react-query';
import { CreditCard, LogOut, User } from 'lucide-react';

export function SidebarUserInfo() {
  const {
    data: { user },
  } = useSuspenseQuery(orpc.workspace.list.queryOptions());

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="size-12 rounded-xl hover:rounded-lg transition-all duration-200 bg-background/50 border-border/50 hover:bg-accent hover:text-accent"
        >
          <Avatar>
            <AvatarImage
              src={getAvatar(user.picture, user.email || 'anonymous')}
              alt="User Image"
              className="object-cover"
            />
            <AvatarFallback>
              {((user.given_name?.[0] ?? 'X') + (user.family_name?.[0] ?? '')).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side="right" sideOffset={8} className="w-[200px]">
        <DropdownMenuLabel className="font-normal flex items-center gap-2 px-1 py-2 text-left text-sm">
          <Avatar className="relative size-8 rounded-lg">
            <AvatarImage
              src={getAvatar(user.picture, user.email || 'anonymous')}
              alt="User Image"
              className="object-cover"
            />
            <AvatarFallback>
              {((user.given_name?.[0] ?? 'X') + (user.family_name?.[0] ?? '')).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <p className="truncate font-medium">{user.given_name + ' ' + user.family_name}</p>
            <p className="truncate text-xs leading-none text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <PortalLink>
              <User />
              Account
            </PortalLink>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <PortalLink>
              <CreditCard />
              Biiling
            </PortalLink>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <LogoutLink>
              <LogOut /> Logout
            </LogoutLink>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
