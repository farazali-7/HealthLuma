"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, ArrowRight, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const passwordChecks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
  };

  const isPasswordValid =
    passwordChecks.length && passwordChecks.uppercase && passwordChecks.number;

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    if (!isPasswordValid) return;

    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (data.session) {
      window.location.href = "/dashboard";
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  async function handleGoogleSignup() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-vault-positive/10 border border-vault-positive/20">
            <Check className="size-8 text-vault-positive" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight mb-3">
            Verify your email
          </h1>
          <p className="text-sm text-muted-foreground mb-8 max-w-sm mx-auto leading-relaxed">
            We&apos;ve sent a verification link to{" "}
            <span className="font-medium text-foreground">{email}</span>.
            Please confirm your email to activate your HealthLuma account.
          </p>
          <Button variant="outline" className="rounded-xl h-10" asChild>
            <Link href="/login">Back to Login</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Column */}
      <div className="hidden lg:flex lg:w-[45%] relative bg-[#111820] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#2D4A3E]/30 via-transparent to-[#1A2E44]/20" />

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
              <div className="h-px w-12 bg-[#4D9A7F]" />
              <span className="text-[#4D9A7F] text-xs font-mono uppercase tracking-[0.2em]">
                Join HealthLuma
              </span>
            </div>

            <h2 className="font-display text-3xl font-semibold text-[#E8E5DE] leading-[1.3] mb-6">
              Your journey to
              <br />
              <span className="text-[#4D9A7F]">better health management.</span>
            </h2>

            <p className="text-[#A0A5AD] text-[15px] leading-relaxed mb-10">
              HealthLuma helps patients and doctors manage appointments,
              prescriptions, and medical records in one secure, modern platform.
              Built with privacy, clarity, and care at its core.
            </p>

            <div className="space-y-4">
              {[
                "Secure storage of medical records",
                "Appointment scheduling & tracking",
                "Doctor & patient dashboards with role-based access",
              ].map((benefit, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-[#4D9A7F]/15">
                    <Check className="size-3 text-[#4D9A7F]" />
                  </div>
                  <span className="text-sm text-[#A0A5AD]">
                    {benefit}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="text-[13px] text-[#6B7280] italic font-display">
            &ldquo;Because every health decision deserves clarity.&rdquo;
          </div>
        </div>
      </div>

      {/* Right Column */}
      <div className="flex-1 flex items-center justify-center bg-background px-6 py-12">
        <div className="w-full max-w-[420px]">
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
              Create your HealthLuma account
            </h1>
            <p className="text-sm text-muted-foreground">
              Already registered?{" "}
              <Link
                href="/login"
                className="text-primary font-medium hover:underline underline-offset-4"
              >
                Sign in
              </Link>
            </p>
          </div>

          <Button
            variant="outline"
            className="w-full h-11 rounded-xl text-sm font-medium gap-3 mb-6"
            onClick={handleGoogleSignup}
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
                or sign up with email
              </span>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-sm text-destructive">
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="h-11 rounded-xl"
              />
            </div>

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
              <Label htmlFor="password">Create Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a secure password"
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

              {password.length > 0 && (
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                  {[
                    { check: passwordChecks.length, label: "At least 8 characters" },
                    { check: passwordChecks.uppercase, label: "One uppercase letter" },
                    { check: passwordChecks.number, label: "One number" },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-1.5 text-xs transition-colors ${
                        item.check
                          ? "text-vault-positive"
                          : "text-muted-foreground"
                      }`}
                    >
                      <div
                        className={`size-3.5 rounded-full flex items-center justify-center ${
                          item.check
                            ? "bg-vault-positive/15"
                            : "bg-muted"
                        }`}
                      >
                        {item.check && <Check className="size-2.5" />}
                      </div>
                      {item.label}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading || !isPasswordValid}
              className="w-full h-11 rounded-xl text-sm font-medium mt-2 gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Creating your account...
                </>
              ) : (
                <>
                  Join HealthLuma
                  <ArrowRight className="size-4" />
                </>
              )}
            </Button>
          </form>

          <p className="mt-8 text-center text-xs text-muted-foreground/60">
            By creating an account, you agree to HealthLuma&apos;s{" "}
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