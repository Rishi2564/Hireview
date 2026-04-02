"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Signup failed.");
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 border-b border-surface-border bg-surface/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-bold text-sm shadow-brand-sm">
              H
            </span>
            <span className="font-display font-semibold text-white text-lg tracking-tight">
              Hire<span className="text-gradient">View</span>
            </span>
          </Link>
          <Link href="/login" className="btn-secondary text-xs">
            Log in
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-xl mx-auto w-full px-4 sm:px-6 py-10">
        <div className="glass-card p-6 sm:p-8">
          <h1 className="font-display font-bold text-2xl text-white">
            Create your account
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Sign up to save your progress and come back anytime.
          </p>

          <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-300" htmlFor="name">
                Name
              </label>
              <input
                id="name"
                className="input-field"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                autoComplete="name"
                disabled={loading}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-300" htmlFor="email">
                Email <span className="text-brand-400">*</span>
              </label>
              <input
                id="email"
                className="input-field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                disabled={loading}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-300" htmlFor="password">
                Password <span className="text-brand-400">*</span>
              </label>
              <input
                id="password"
                type="password"
                className="input-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                autoComplete="new-password"
                disabled={loading}
                minLength={8}
                required
              />
            </div>

            {error && (
              <div className="rounded-xl bg-red-950/50 border border-red-700/40 px-4 py-3 text-sm text-red-300">
                <strong>Error: </strong>
                {error}
              </div>
            )}

            <button className="btn-primary w-full py-3.5 text-base" disabled={loading}>
              {loading ? "Creating account…" : "Sign up"}
            </button>

            <p className="text-center text-xs text-gray-600">
              Already have an account?{" "}
              <Link href="/login" className="text-brand-300 hover:text-brand-200">
                Log in
              </Link>
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}

