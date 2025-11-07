import { client } from '@/lib/orpc';
import { redirect } from 'next/navigation';
import React from 'react';

// import { IconFolderCode } from '@tabler/icons-react';
import { ArrowUpRightIcon, Cloud } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { CreateNewChannel } from './_components/CreateNewChannel';

interface WorkspaceIdPageProps {
  params: Promise<{ workspaceId: string }>;
}

const WorkspaceIdPage = async ({ params }: WorkspaceIdPageProps) => {
  const { workspaceId } = await params;
  const { channels } = await client.channel.list();

  if (channels.length > 0) {
    return redirect(`/workspace/${workspaceId}/channel/${channels[0].id}`);
  }

  return (
    <div className="p-16 flex flex-1">
      <Empty className="border border-dashed from-muted/50 to-background h-full bg-gradient-to-b from-30%">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Cloud />
          </EmptyMedia>
          <EmptyTitle>Channel Empty</EmptyTitle>
          <EmptyDescription>There are no channels in this workspace.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent className="max-w-sm mx-auto">
          <CreateNewChannel />
        </EmptyContent>
      </Empty>
    </div>
  );
};

export default WorkspaceIdPage;
