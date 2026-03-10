"use client";

// This page redirects to /dashboard/billing
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AccountsRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/dashboard/billing");
  }, [router]);
  return null;
}
