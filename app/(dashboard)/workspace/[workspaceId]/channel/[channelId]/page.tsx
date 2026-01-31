'use client';

import { useParams } from 'next/navigation';
import { ChannelHeader } from './_components/ChannelHeader';
import { MessageInputForm } from './_components/message/MessageInputForm';
import { MessagesList } from './_components/MessagesList';
import { useQuery } from '@tanstack/react-query';
import { orpc } from '@/lib/orpc';
import { KindeUser } from '@kinde-oss/kinde-auth-nextjs';
import { Skeleton } from '@/components/ui/skeleton';
import { ThreadSidebar } from './_components/thread/ThreadSidebar';
import { ThreadProvider, useThread } from '@/providers/ThreadProvider';

const ChannelPageMain = () => {
  const { channelId } = useParams<{ channelId: string }>();

  const { isThreadOpen } = useThread();

  const { data, error, isLoading } = useQuery(
    orpc.channel.get.queryOptions({
      input: {
        channelId: channelId,
      },
    }),
  );

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="flex h-screen w-full">
      <div className="flex flex-col flex-1 min-w-0">
        {/* Fixed Header */}
        {isLoading ? (
          <div className="w-full flex items-center justify-between h-14 px-4 py-2 border-b">
            <Skeleton className="h-6 w-40" />
            <div className="flex items-center space-x-2">
              <Skeleton className="h-8 w-28" />
              <Skeleton className="h-8 w-28" />
              <Skeleton className="size-8" />
            </div>
          </div>
        ) : (
          <ChannelHeader />
        )}

        {/* Scorll message area */}
        <div className="flex-1 overflow-y-auto mb-4">
          <MessagesList />
        </div>

        {/*Fixed Ipnut area */}
        <div className="border-t bg-background p-4">
          <MessageInputForm
            channelId={channelId}
            user={data?.currentUser as KindeUser<Record<string, unknown>>}
          />
        </div>
      </div>

      {isThreadOpen && <ThreadSidebar />}
    </div>
  );
};

const ChannelPage = () => {
  return (
    <ThreadProvider>
      <ChannelPageMain />
    </ThreadProvider>
  );
};

export default ChannelPage;
