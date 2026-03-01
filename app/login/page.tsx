"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    window.location.href = "/dashboard";
  }

  async function handleGoogleLogin() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Column */}
      <div className="hidden lg:flex lg:w-[45%] relative bg-[#111820] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1A2E44]/40 via-transparent to-[#2D4A3E]/20" />

        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <div>
            <Link
              href="/"
              className="font-display font-bold text-xl text-[#E8E5DE] tracking-tight"
            >
              HealthLuma
            </Link>
          </div>

          {/* Content */}
          <div className="max-w-md">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-px w-12 bg-[#C4975A]" />
              <span className="text-[#C4975A] text-xs font-mono uppercase tracking-[0.2em]">
                Welcome Back
              </span>
            </div>

            <h2 className="font-display text-3xl font-semibold text-[#E8E5DE] leading-[1.3] mb-6">
              Your health journey continues.
              <br />
              <span className="text-[#C4975A]">Clarity. Care. Confidence.</span>
            </h2>

            <p className="text-[#A0A5AD] text-[15px] leading-relaxed mb-10">
              Access your appointments, medical records, and care plans in one
              secure place. HealthLuma keeps your health information organized
              and protected — so you can focus on what truly matters.
            </p>

            {/* Trust indicators */}
            <div className="grid grid-cols-2 gap-6">
              <div className="border border-white/[0.06] rounded-xl p-4 bg-white/[0.02]">
                <div className="text-2xl font-semibold text-[#E8E5DE] mb-1">
                  256-bit
                </div>
                <div className="text-xs text-[#6B7280]">
                  Advanced data encryption
                </div>
              </div>
              <div className="border border-white/[0.06] rounded-xl p-4 bg-white/[0.02]">
                <div className="text-2xl font-semibold text-[#4D9A7F] mb-1">
                  100%
                </div>
                <div className="text-xs text-[#6B7280]">
                  Private & confidential records
                </div>
              </div>
            </div>
          </div>

          <div className="text-[13px] text-[#6B7280] italic font-display">
            &ldquo;Because your health deserves complete clarity.&rdquo;
          </div>
        </div>
      </div>

      {/* Right Column */}
      <div className="flex-1 flex items-center justify-center bg-background px-6 py-12">
        <div className="w-full max-w-[420px]">
          {/* Mobile logo */}
          <div className="lg:hidden mb-10">
            <Link
              href="/"
              className="font-display font-bold text-xl text-foreground tracking-tight"
            >
              HealthLuma
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-foreground tracking-tight mb-2">
              Sign in to HealthLuma
            </h1>
            <p className="text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="text-primary font-medium hover:underline underline-offset-4"
              >
                Create one
              </Link>
            </p>
          </div>

          <Button
            variant="outline"
            className="w-full h-11 rounded-xl text-sm font-medium gap-3 mb-6"
            onClick={handleGoogleLogin}
            type="button"
          >
            Continue with Google
          </Button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-background px-3 text-muted-foreground">
                or sign in with email
              </span>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-sm text-destructive">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@healthluma.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/login"
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 rounded-xl pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl text-sm font-medium mt-2 gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Signing you in...
                </>
              ) : (
                <>
                  Access Dashboard
                  <ArrowRight className="size-4" />
                </>
              )}
            </Button>
          </form>

          <p className="mt-8 text-center text-xs text-muted-foreground/60">
            By continuing, you agree to HealthLuma&apos;s{" "}
            <Link
              href="/"
              className="underline underline-offset-4 hover:text-muted-foreground"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/"
              className="underline underline-offset-4 hover:text-muted-foreground"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}