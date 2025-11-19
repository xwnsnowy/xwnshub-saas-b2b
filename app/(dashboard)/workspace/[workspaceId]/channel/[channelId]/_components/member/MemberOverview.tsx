import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { orpc } from '@/lib/orpc';
import { useQuery } from '@tanstack/react-query';
import { Search, Users } from 'lucide-react';
import { useState } from 'react';
import { MemberItem } from './MemberItem';
import { Skeleton } from '@/components/ui/skeleton';

export function MemberOverview() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const { data, isLoading, error } = useQuery(orpc.workspace.member.list.queryOptions());

  const members = data ?? [];

  const query = search.trim().toLowerCase();

  const filteredMembers = query
    ? members.filter((member) => {
        return (
          member.full_name?.toLowerCase().includes(query) ||
          member.email?.toLowerCase().includes(query)
        );
      })
    : members;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline">
          <Users />
          <span>Members</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[300px] p-0">
        <div className="p-0">
          {/* Header */}
          <div className="p-4 border-b">
            <h3 className="font-semibold text-sm">Workspace Members</h3>
            <p className="text-xs text-muted-foreground">{data?.length} Members</p>
          </div>
          {/* Search */}
          <div className="p-4 border-b">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none"
                aria-hidden="true"
              />
              <Input
                placeholder="Search members..."
                className="pl-9 h-9"
                aria-label="Search members"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Member List */}
          <div className="max-h-80 overflow-y-auto">
            {error ? (
              <p className="p-4 text-sm text-red-500">Error loading members.</p>
            ) : isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="animate-pulse flex items-center justify-center p-3 space-x-4"
                >
                  <Skeleton className="size-8 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4 rounded" />
                    <Skeleton className="h-3 w-1/2 rounded" />
                  </div>
                </div>
              ))
            ) : filteredMembers.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">No members found.</p>
            ) : (
              filteredMembers.map((member) => <MemberItem key={member.id} member={member} />)
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
