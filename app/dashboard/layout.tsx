"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { AppSidebar } from "@/components/app-sidebar";
import { createClient } from "@/lib/supabase/client";
import { UserProvider } from "./context";
import type { User } from "@supabase/supabase-js";
import { Bell, Heart } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getUser() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setUser(user);
      setLoading(false);
    }
    getUser();
  }, [router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10">
            <Heart className="size-5 text-primary animate-pulse" strokeWidth={2.5} />
          </div>
          <div className="flex flex-col items-center gap-1">
            <span
              className="text-base font-semibold text-foreground"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              HealthLuma
            </span>
            <span className="text-xs text-muted-foreground">
              Loading your health data…
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <UserProvider user={user}>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          {/* ── Top Header ──────────────────────────────── */}
          <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/90 px-4 backdrop-blur-sm">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-1 h-4!" />
            <span className="text-sm text-muted-foreground/60">HealthLuma</span>

            <div className="ml-auto flex items-center gap-1">
              {/* Notification bell */}
              <button
                className="relative flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
                aria-label="Notifications"
              >
                <Bell className="size-4" />
                {/* Unread indicator */}
                <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-accent" />
              </button>
            </div>
          </header>

          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </UserProvider>
  );
}
