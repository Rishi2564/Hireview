"use client";

import { useState, useRef, useCallback } from "react";

const ROLE_SUGGESTIONS = [
  "Frontend Engineer", "Backend Engineer", "Full Stack Engineer",
  "DevOps Engineer", "Data Scientist", "Machine Learning Engineer",
  "Senior Machine Learning Engineer", "Data Engineer", "Cloud Architect",
  "Product Manager", "iOS Developer", "Android Developer",
  "Site Reliability Engineer", "Cybersecurity Analyst", "Blockchain Developer",
  "Software Engineer", "Solutions Architect", "AI/ML Engineer",
];

interface InputPanelProps {
  onResult: (data: AnalysisResult) => void;
  onLoading: (loading: boolean) => void;
  onTargetRoleChange: (role: string) => void;
  loading: boolean;
}

export interface AnalysisResult {
  skills: { strong: string[]; moderate: string[]; weak: string[] };
  missing_skills: string[];
  skill_gaps: string[];
  readiness_score: number;
  summary: string;
  roadmap: { phase: string; focus: string[]; recommended_projects: string[] }[];
}

export default function InputPanel({ onResult, onLoading, onTargetRoleChange, loading }: InputPanelProps) {
  const [resume, setResume] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [roleError, setRoleError] = useState("");
  const [resumeError, setResumeError] = useState("");
  const [pdfStatus, setPdfStatus] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [apiError, setApiError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const extractPdfText = async (file: File) => {
    try {
      setPdfStatus("Extracting PDF…");
      // Prefer bundling the worker (more reliable than a CDN in dev / restricted networks),
      // but fall back to CDN if bundling isn't available.
      const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
      try {
        pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
          "pdfjs-dist/legacy/build/pdf.worker.min.mjs",
          import.meta.url
        ).toString();
      } catch {
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
      }
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let text = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map((item: { str?: string }) => item.str ?? "").join(" ") + "\n";
      }
      setResume(text.trim());
      setPdfStatus(`✓ Extracted ${pdf.numPages} page${pdf.numPages > 1 ? "s" : ""}`);
    } catch (err) {
      console.error(err);
      setPdfStatus("⚠ Could not extract PDF — paste text manually.");
    }
  };

  const extractTextFile = async (file: File) => {
    try {
      setPdfStatus("Reading text file…");
      const text = await file.text();
      setResume(text.trim());
      setPdfStatus("✓ Loaded text file");
    } catch (err) {
      console.error(err);
      setPdfStatus("⚠ Could not read text file — paste text manually.");
    }
  };

  const handleFileChange = (file: File | null) => {
    if (!file) return;
    setApiError("");
    setResumeError("");

    const isPdf =
      file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    const isTxt =
      file.type === "text/plain" || file.name.toLowerCase().endsWith(".txt");

    if (isPdf) return void extractPdfText(file);
    if (isTxt) return void extractTextFile(file);

    setPdfStatus(
      `⚠ Unsupported file type (${file.type || "unknown"}). Please upload a PDF or TXT.`
    );
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileChange(file);
  }, []);

  const validate = () => {
    let valid = true;
    if (!targetRole.trim()) { setRoleError("Please enter a target role."); valid = false; }
    else setRoleError("");
    if (!resume.trim()) { setResumeError("Please paste your resume text or upload a PDF."); valid = false; }
    else setResumeError("");
    return valid;
  };

  const handleAnalyze = async () => {
    if (!validate()) return;
    setApiError("");
    onLoading(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText: resume, targetRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed.");
      onResult(data as AnalysisResult);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      onLoading(false);
    }
  };

  return (
    <div className="glass-card p-6 flex flex-col gap-5 h-fit sticky top-24">
      {/* Panel title */}
      <div>
        <h2 className="font-display font-semibold text-lg text-white">Your Resume &amp; Target</h2>
        <p className="text-gray-500 text-sm mt-0.5">Fill in both fields and run the analysis.</p>
      </div>

      {/* Target Role */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="target-role" className="text-sm font-medium text-gray-300">
          Target Role <span className="text-brand-400">*</span>
        </label>
        <input
          id="target-role"
          type="text"
          list="role-suggestions"
          value={targetRole}
          onChange={e => { setTargetRole(e.target.value); onTargetRoleChange(e.target.value); if (roleError) setRoleError(""); }}
          placeholder="e.g. Senior Machine Learning Engineer"
          className="input-field"
          disabled={loading}
          autoComplete="off"
        />
        <datalist id="role-suggestions">
          {ROLE_SUGGESTIONS.map(r => <option key={r} value={r} />)}
        </datalist>
        {roleError && <p className="text-red-400 text-xs">{roleError}</p>}
      </div>

      {/* Resume textarea */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="resume-textarea" className="text-sm font-medium text-gray-300">
          Resume Text <span className="text-brand-400">*</span>
        </label>
        <div
          className={`relative rounded-xl transition-all duration-200 ${
            isDragging ? "ring-2 ring-brand-400 ring-offset-1 ring-offset-surface-card" : ""
          }`}
          onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <textarea
            id="resume-textarea"
            rows={13}
            value={resume}
            onChange={e => { setResume(e.target.value); if (resumeError) setResumeError(""); }}
            placeholder={"Paste your resume text here…\n\nOr drop a PDF file anywhere on this area."}
            className="input-field resize-none leading-relaxed"
            disabled={loading}
          />
          {isDragging && (
            <div className="absolute inset-0 flex flex-col items-center justify-center rounded-xl bg-brand-900/70 border-2 border-dashed border-brand-400 pointer-events-none">
              <span className="text-3xl mb-2">📄</span>
              <span className="text-brand-300 font-semibold">Drop PDF here</span>
            </div>
          )}
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2 mt-0.5">
          <label
            htmlFor="pdf-upload"
            className="btn-secondary text-xs cursor-pointer"
            tabIndex={0}
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            Upload PDF
          </label>
          <input
            ref={fileInputRef}
            id="pdf-upload"
            type="file"
            accept=".pdf,.txt,text/plain,application/pdf"
            className="hidden"
            onChange={e => handleFileChange(e.target.files?.[0] ?? null)}
          />
          {pdfStatus && (
            <span className={`text-xs ${pdfStatus.startsWith("✓") ? "text-green-400" : "text-amber-400"}`}>
              {pdfStatus}
            </span>
          )}
          <button
            className="btn-ghost text-xs ml-auto"
            onClick={() => { setResume(""); setPdfStatus(""); if (fileInputRef.current) fileInputRef.current.value = ""; }}
            disabled={loading}
            type="button"
          >
            Clear
          </button>
        </div>
        {resumeError && <p className="text-red-400 text-xs">{resumeError}</p>}
      </div>

      {/* API Error */}
      {apiError && (
        <div className="rounded-xl bg-red-950/50 border border-red-700/40 px-4 py-3 text-sm text-red-300">
          <strong>Error: </strong>{apiError}
        </div>
      )}

      {/* Analyze Button */}
      <button
        id="analyze-btn"
        onClick={handleAnalyze}
        disabled={loading}
        className="btn-primary w-full py-3.5 text-base"
      >
        {loading ? (
          <>
            <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
            </svg>
            Analyzing your profile…
          </>
        ) : (
          <>
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            Analyze Resume
          </>
        )}
      </button>

      <p className="text-center text-xs text-gray-600">
        Powered by Google Gemini 1.5 Flash · Free API
      </p>
    </div>
  );
}
