import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Search, Users } from 'lucide-react';
import { useState } from 'react';

export function MemberOverview() {
  const [open, setOpen] = useState(false);

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
            <p className="text-xs text-muted-foreground">5 Members</p>
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
            {/* Example Member Item */}
            <div className="flex items-center justify-between p-4 hover:bg-accent ">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-medium text-white">
                  AB
                </div>
                <div>
                  <p className="font-medium">Alice Brown</p>
                  <p className="text-xs text-muted-foreground">@alicebrown</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  type="button"
                  className="gap-1.5 px-2.5 py-1.5 text-xs"
                >
                  Message
                </Button>
                <Users className="size-4" />
              </div>
            </div>

            {/* Repeat Member Items as needed */}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
