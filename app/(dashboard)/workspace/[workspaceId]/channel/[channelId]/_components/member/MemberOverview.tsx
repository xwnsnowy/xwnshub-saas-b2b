import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { orpc } from '@/lib/orpc';
import { useQuery } from '@tanstack/react-query';
import { Search, Users } from 'lucide-react';
import { useState } from 'react';
import { MemberItem } from './MemberItem';

export function MemberOverview() {
  const [open, setOpen] = useState(false);
  const { data, isLoading, error } = useQuery(orpc.workspace.member.list.queryOptions());

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
              />
            </div>
          </div>

          {/* Member List */}
          <div className="max-h-80 overflow-y-auto">
            {data?.map((member) => (
              <MemberItem key={member.id} member={member} />
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
