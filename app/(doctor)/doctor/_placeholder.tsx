import type { LucideIcon } from "lucide-react";

export function PlaceholderPage({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl border border-border bg-muted/40">
        <Icon className="size-6 text-muted-foreground" />
      </div>
      <h1
        className="mt-5 text-2xl font-semibold tracking-tight text-foreground"
        style={{ fontFamily: "var(--font-playfair)" }}
      >
        {title}
      </h1>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
