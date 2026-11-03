/**
 * A borderless app window: traffic lights, a centred title, then content.
 * Shared by the hero terminal and the project showcase.
 */
export function Window({
  title,
  className = "",
  onClick,
  children,
}: {
  title: React.ReactNode;
  className?: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div onClick={onClick} className={`card overflow-hidden text-left ${className}`}>
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        {/* macOS window controls: literal colours, not theme tokens. */}
        <span className="h-3 w-3 shrink-0 rounded-full bg-[#ff5f57]" />
        <span className="h-3 w-3 shrink-0 rounded-full bg-[#febc2e]" />
        <span className="h-3 w-3 shrink-0 rounded-full bg-[#28c840]" />
        <span className="flex-1 truncate text-center font-mono text-xs text-foreground-subtle">{title}</span>
        <span className="w-12 shrink-0" />
      </div>
      {children}
    </div>
  );
}
