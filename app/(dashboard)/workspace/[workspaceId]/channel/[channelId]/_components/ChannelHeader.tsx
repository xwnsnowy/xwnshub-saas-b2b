import { ThemeToggle } from '@/components/ui/theme-toggle';

export function ChannelHeader() {
  return (
    <div className="w-full border-b border-border px-4 py-2 h-14 flex items-center justify-between">
      <h1 className="text-lg font-semibold">#super-cool-channel</h1>
      <div className="flex items-center space-x-2">
        <ThemeToggle />
      </div>
    </div>
  );
}
