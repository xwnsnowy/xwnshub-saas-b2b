'use client';

import { createContext, useContext, useState } from 'react';

interface ThreadContextType {
  selectedThreadId: string | null;
  openThread: (threadId: string) => void;
  closeThread: () => void;
  tooggleThread: (threadId: string) => void;
  isThreadOpen: boolean;
}

const ThreadContext = createContext<ThreadContextType | undefined>(undefined);

export function ThreadProvider({ children }: { children: React.ReactNode }) {
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [isThreadOpen, setIsThreadOpen] = useState(false);

  const openThread = (threadId: string) => {
    setSelectedThreadId(threadId);
    setIsThreadOpen(true);
  };

  const closeThread = () => {
    setSelectedThreadId(null);
    setIsThreadOpen(false);
  };

  const tooggleThread = (threadId: string) => {
    if (selectedThreadId === threadId) {
      closeThread();
    } else {
      openThread(threadId);
    }
  };

  const value: ThreadContextType = {
    selectedThreadId,
    openThread,
    closeThread,
    tooggleThread,
    isThreadOpen,
  };

  return <ThreadContext.Provider value={value}>{children}</ThreadContext.Provider>;
}

export function useThread() {
  const context = useContext(ThreadContext);
  if (context === undefined) {
    throw new Error('useThread must be used within a ThreadProvider');
  }
  return context;
}
