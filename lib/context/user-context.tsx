"use client";

import { createContext, useContext } from "react";
import type { User } from "@supabase/supabase-js";
import type { UserRole } from "@/lib/supabase/queries";

type UserContextType = {
  user: User;
  role: UserRole;
};

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({
  user,
  role,
  children,
}: {
  user: User;
  role: UserRole;
  children: React.ReactNode;
}) {
  return (
    <UserContext.Provider value={{ user, role }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser(): User {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within a UserProvider");
  return ctx.user;
}

export function useRole(): UserRole {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useRole must be used within a UserProvider");
  return ctx.role;
}
