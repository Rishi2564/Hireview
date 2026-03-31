"use client";

import { useState } from "react";
import InputPanel, { type AnalysisResult } from "@/components/InputPanel";
import ResultsPanel from "@/components/ResultsPanel";

export default function Home() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [targetRole, setTargetRole] = useState("");

  return (
    <div className="min-h-screen flex flex-col">

      {/* ── Header ── */}
      <header className="sticky top-0 z-50 border-b border-surface-border bg-surface/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-bold text-sm shadow-brand-sm">
              H
            </span>
            <span className="font-display font-semibold text-white text-lg tracking-tight">
              Hire<span className="text-gradient">View</span>
            </span>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-brand-900/60 border border-brand-700/40 text-brand-300">
            AI-Powered · Free
          </span>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative py-16 sm:py-20 px-4 text-center overflow-hidden">
        {/* Glow blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute top-0 right-1/4 w-80 h-80 bg-accent-cyan/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/3" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-900/50 border border-brand-700/40 text-brand-300 text-xs font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Powered by Google Gemini 2.5 Flash Lite
          </div>
          <h1 className="font-display font-bold text-4xl sm:text-6xl text-white leading-tight tracking-tight mb-4">
            Know exactly where<br />
            <span className="text-gradient">you stand.</span>
          </h1>
          <p className="text-gray-400 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            Paste your resume, pick your dream role, and get an AI-powered gap analysis,
            readiness score, and personalized roadmap — in seconds.
          </p>
        </div>
      </section>

      {/* ── Main two-column layout ── */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-6 items-start">
          <InputPanel
            onResult={(data) => {
              setResult(data);
            }}
            onLoading={setLoading}
            onTargetRoleChange={setTargetRole}
            loading={loading}
          />
          <ResultsPanel result={result} loading={loading} targetRole={targetRole} />
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-surface-border py-6 text-center text-gray-600 text-sm">
        HireView &mdash; AI Career Coach &copy; 2026 &bull; Google Gemini API (Free Tier)
      </footer>
    </div>
  );
}
