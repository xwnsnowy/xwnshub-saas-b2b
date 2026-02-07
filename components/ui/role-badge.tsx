const roleBadgeClasses: Record<string, string> = {
  admin:
    'bg-blue-50 text-blue-600 ring-blue-700/10 dark:bg-blue-500/15 dark:text-blue-300 dark:ring-blue-400/30',
  owner:
    'bg-purple-50 text-purple-600 ring-purple-700/10 dark:bg-purple-500/15 dark:text-purple-300 dark:ring-purple-400/30',
  member:
    'bg-gray-100 text-gray-600 ring-gray-500/10 dark:bg-gray-700/40 dark:text-gray-300 dark:ring-gray-600/30',
};

interface RoleBadgeProps {
  role: string;
  isAdmin?: boolean;
}

export function RoleBadge({ role, isAdmin }: RoleBadgeProps) {
  const base =
    'inline-flex h-5 items-center px-2 rounded-md text-xs font-medium ring-1 ring-inset leading-none select-none tracking-wide';

  const variant = roleBadgeClasses[role.toLowerCase()] ?? roleBadgeClasses['member'];

  return (
    <span
      className={`${base} ${variant}`}
      aria-label={role}
      title={role.charAt(0).toUpperCase() + role.slice(1)}
      role="note"
    >
      {isAdmin ? 'Admin' : role === 'owner' ? 'Owner' : 'Member'}
    </span>
  );
}
