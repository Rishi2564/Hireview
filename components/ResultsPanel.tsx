"use client";

import { useEffect, useRef, useState } from "react";
import type { AnalysisResult } from "./InputPanel";

interface ResultsPanelProps {
  result: AnalysisResult | null;
  loading: boolean;
  targetRole: string;
}

function ReadinessGauge({ score }: { score: number }) {
  const radius = 52;
  const circ = 2 * Math.PI * radius;
  const [animatedScore, setAnimatedScore] = useState(0);
  const [offset, setOffset] = useState(circ);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScore(score);
      setOffset(circ - (score / 100) * circ);
    }, 300);
    return () => clearTimeout(timer);
  }, [score, circ]);

  const color =
    score >= 70 ? "#4ade80" : score >= 40 ? "#fbbf24" : "#f87171";
  const label =
    score >= 80 ? "Excellent" : score >= 60 ? "Good" : score >= 40 ? "Fair" : "Needs Work";

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="130" height="130" viewBox="0 0 130 130" className="-rotate-90">
        {/* Background ring */}
        <circle
          cx="65" cy="65" r={radius}
          fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10"
        />
        {/* Coloured fill */}
        <circle
          cx="65" cy="65" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1.4s cubic-bezier(.34,1.56,.64,1), stroke 0.3s" }}
        />
      </svg>
      {/* Centre text (counter-rotate) */}
      <div className="-mt-[114px] flex flex-col items-center justify-center h-[114px] pointer-events-none">
        <span className="font-display font-bold text-3xl text-white leading-none">
          {animatedScore}%
        </span>
        <span className="text-xs text-gray-400 mt-0.5">{label}</span>
      </div>
      <div className="mt-1" />
    </div>
  );
}

function SkillChip({ label, variant }: { label: string; variant: "strong" | "moderate" | "weak" | "missing" }) {
  const cls = {
    strong: "chip-strong",
    moderate: "chip-moderate",
    weak: "chip-weak",
    missing: "chip-missing",
  }[variant];
  return <span className={`skill-chip ${cls}`}>{label}</span>;
}

function PhaseCard({
  phase, focus, recommended_projects, index,
}: { phase: string; focus: string[]; recommended_projects: string[]; index: number }) {
  const [open, setOpen] = useState(index === 0);
  const icons = ["🌱", "🚀", "⚡️"];
  const colors = [
    "from-emerald-800/30 to-emerald-900/10 border-emerald-700/30",
    "from-blue-800/30 to-blue-900/10 border-blue-700/30",
    "from-purple-800/30 to-purple-900/10 border-purple-700/30",
  ];

  return (
    <div className={`rounded-xl border bg-gradient-to-br ${colors[index]} overflow-hidden transition-all duration-200`}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left"
        type="button"
      >
        <span className="text-xl">{icons[index]}</span>
        <span className="font-display font-semibold text-white flex-1">{phase}</span>
        <span className={`text-gray-400 text-xs transition-transform duration-200 ${open ? "rotate-180" : ""}`}>▼</span>
      </button>
      {open && (
        <div className="px-5 pb-5 flex flex-col gap-4 animate-in">
          {focus.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">Focus Areas</p>
              <ul className="space-y-1.5">
                {focus.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                    <span className="text-brand-400 mt-0.5">•</span>{f}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {recommended_projects.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">Recommended Projects</p>
              <ul className="space-y-1.5">
                {recommended_projects.map((p, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                    <span className="text-accent-cyan mt-0.5">▸</span>{p}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ResultsPanel({ result, loading, targetRole }: ResultsPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (result && panelRef.current) {
      panelRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [result]);

  /* ── Loading skeleton ── */
  if (loading) {
    return (
      <div className="flex flex-col gap-5" aria-label="Loading analysis">
        {[180, 120, 220, 160, 200].map((h, i) => (
          <div
            key={i}
            className="glass-card rounded-2xl animate-pulse"
            style={{ height: h }}
          />
        ))}
      </div>
    );
  }

  /* ── Empty state ── */
  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 min-h-[60vh] text-center px-6">
        <div className="w-20 h-20 rounded-2xl bg-surface-elevated flex items-center justify-center text-4xl shadow-glass mb-2">
          🧭
        </div>
        <h3 className="font-display font-semibold text-xl text-white">Your analysis will appear here</h3>
        <p className="text-gray-500 text-sm max-w-xs">
          Fill in the form on the left and click <span className="text-brand-400 font-medium">Analyze Resume</span> to get a detailed breakdown.
        </p>
      </div>
    );
  }

  const { skills, missing_skills, skill_gaps, readiness_score, summary, roadmap } = result;

  return (
    <div ref={panelRef} className="flex flex-col gap-5 animate-in">

      {/* ── Readiness Score ── */}
      <div className="glass-card p-6 flex flex-col sm:flex-row items-center gap-6">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1">Readiness Score</p>
          <h3 className="font-display font-bold text-2xl text-white leading-tight">
            {readiness_score >= 70 ? "You're in great shape!" : readiness_score >= 40 ? "Some gaps to bridge" : "Significant prep needed"}
          </h3>
          {targetRole && (
            <p className="text-gray-500 text-sm mt-1">for <span className="text-brand-300">{targetRole}</span></p>
          )}
        </div>
        <ReadinessGauge score={readiness_score} />
      </div>

      {/* ── Summary ── */}
      <div className="glass-card p-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-3">
          📋 Evaluation Summary
        </p>
        <p className="text-gray-200 text-sm leading-relaxed">{summary}</p>
      </div>

      {/* ── Skills Breakdown ── */}
      <div className="glass-card p-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-4">
          🧠 Skills Breakdown
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Strong */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
              <span className="text-xs font-semibold text-green-400">Strong</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {skills.strong.length ? skills.strong.map(s => <SkillChip key={s} label={s} variant="strong" />) : <span className="text-gray-600 text-xs">None listed</span>}
            </div>
          </div>
          {/* Moderate */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
              <span className="text-xs font-semibold text-amber-400">Moderate</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {skills.moderate.length ? skills.moderate.map(s => <SkillChip key={s} label={s} variant="moderate" />) : <span className="text-gray-600 text-xs">None listed</span>}
            </div>
          </div>
          {/* Weak */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <span className="w-2 h-2 rounded-full bg-orange-400 inline-block" />
              <span className="text-xs font-semibold text-orange-400">Weak</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {skills.weak.length ? skills.weak.map(s => <SkillChip key={s} label={s} variant="weak" />) : <span className="text-gray-600 text-xs">None listed</span>}
            </div>
          </div>
        </div>
      </div>

      {/* ── Missing Skills ── */}
      {missing_skills.length > 0 && (
        <div className="glass-card p-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1">🚫 Missing Skills</p>
          <p className="text-gray-600 text-xs mb-3">Not present in your resume but required for this role.</p>
          <div className="flex flex-wrap gap-1.5">
            {missing_skills.map(s => <SkillChip key={s} label={s} variant="missing" />)}
          </div>
        </div>
      )}

      {/* ── Skill Gaps ── */}
      {skill_gaps.length > 0 && (
        <div className="glass-card p-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1">⚠️ Skill Gaps</p>
          <p className="text-gray-600 text-xs mb-3">Present but not at the required level.</p>
          <ul className="space-y-2">
            {skill_gaps.map((g, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                <span className="text-amber-400 mt-0.5 shrink-0">→</span>{g}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Roadmap ── */}
      {roadmap?.length > 0 && (
        <div className="glass-card p-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1">🗺️ Learning Roadmap</p>
          <p className="text-gray-600 text-xs mb-4">Your personalized path to becoming job-ready.</p>
          <div className="flex flex-col gap-3">
            {roadmap.map((phase, i) => (
              <PhaseCard key={phase.phase} {...phase} index={i} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
