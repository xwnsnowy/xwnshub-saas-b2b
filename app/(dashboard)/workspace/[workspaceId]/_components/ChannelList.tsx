'use client';

import { orpc } from '@/lib/orpc';
import { useSuspenseQuery } from '@tanstack/react-query';
import Link from 'next/link';

export function ChannelsList() {
  const {
    data: { channels },
  } = useSuspenseQuery(orpc.channel.list.queryOptions());

  return (
    <div className="space-y-1 py-1">
      {channels.map((channel) => (
        <Link
          key={channel.id}
          href={`/workspace/${channel.id}/channel/${channel.id}`}
          className="flex justify-start items-center px-2 py-1 text-sm font-mono font-medium rounded-md border text-muted-foreground hover:text-foreground hover:bg-teal-700 transition-colors duration-200"
        >
          <span className="truncate">#{channel.name}</span>
        </Link>
      ))}
    </div>
  );
}
