import React from 'react';
import { WorkspaceHeader } from './_components/WorkspaceHeader';
import { CreateNewChannel } from './_components/CreateNewChannel';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { ChevronsDown } from 'lucide-react';
import { ChannelsList } from './_components/ChannelList';
import { MemberList } from './_components/MemberList';
import { getQueryClient, HydrateClient } from '@/lib/query/hydration';
import { orpc } from '@/lib/orpc';

const ChannelListLayout = async ({ children }: { children: React.ReactNode }) => {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery(orpc.channel.list.queryOptions());

  return (
    <div className="flex h-full w-80 flex-col bg-secondary border-r border-border">
      <div className="flex items-center px-4 h-14 border-b border-border">
        <HydrateClient client={queryClient}>
          <WorkspaceHeader />
        </HydrateClient>
      </div>

      <div className="px-4 py-2">
        <CreateNewChannel />
      </div>

      {/* Channels List*/}
      <div className="flex-1 overflow-y-auto px-4">
        <Collapsible defaultOpen>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="w-full flex items-center justify-between px-2 py-1 text-sm font-medium text-muted-foreground [&[data-state=open]>svg]:rotate-180"
            >
              Main
              <ChevronsDown className="size-4 transition-transform duration-200" />
              <span className="sr-only">Toggle</span>
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <HydrateClient client={queryClient}>
              <ChannelsList />
            </HydrateClient>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Members List*/}
      <div className="px-3 py-2 border-t border-border">
        <Collapsible defaultOpen>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="w-full flex items-center justify-between px-2 py-1 text-sm font-medium text-muted-foreground [&[data-state=open]>svg]:rotate-180"
            >
              Members
              <ChevronsDown className="size-4 transition-transform duration-200" />
              <span className="sr-only">Toggle</span>
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <HydrateClient client={queryClient}>
              <MemberList />
            </HydrateClient>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
};

export default ChannelListLayout;
