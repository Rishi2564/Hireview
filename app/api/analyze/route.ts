import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const SYSTEM_PROMPT = `You are an expert AI career coach and technical hiring manager.

Analyze the candidate's resume and compare it against the target job role.

Return STRICT JSON only (no markdown, no prose). Output MUST match this exact shape:
{
  "skills": { "strong": string[], "moderate": string[], "weak": string[] },
  "missing_skills": string[],
  "skill_gaps": string[],
  "readiness_score": number, // integer 0-100
  "summary": string,
  "roadmap": [
    { "phase": string, "focus": string[], "recommended_projects": string[] }
  ]
}

Guidelines:
- "skills.strong/moderate/weak" are skills found in the resume.
- "missing_skills" are important skills for the role not present in the resume.
- "skill_gaps" are 1-sentence statements describing where the resume is weak vs the role.
- "summary" should be 3-6 sentences.
- "roadmap" should have 2-4 phases with actionable focus and projects.
- Keep lists concise and deduplicated.`;

export async function POST(req: NextRequest) {
  try {
    const { resumeText, targetRole } = await req.json();

    if (!resumeText || !targetRole) {
      return NextResponse.json(
        { error: "resumeText and targetRole are required." },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Missing GEMINI_API_KEY on the server." },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `${SYSTEM_PROMPT}\n\nResume:\n${resumeText}\n\nTarget Role:\n${targetRole}\n`,
            },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseJsonSchema: {
          type: "object",
          additionalProperties: true,
          required: [
            "skills",
            "missing_skills",
            "skill_gaps",
            "readiness_score",
            "summary",
            "roadmap",
          ],
          properties: {
            skills: {
              type: "object",
              required: ["strong", "moderate", "weak"],
              properties: {
                strong: { type: "array", items: { type: "string" } },
                moderate: { type: "array", items: { type: "string" } },
                weak: { type: "array", items: { type: "string" } },
              },
              additionalProperties: true,
            },
            missing_skills: { type: "array", items: { type: "string" } },
            skill_gaps: { type: "array", items: { type: "string" } },
            readiness_score: { type: "integer", minimum: 0, maximum: 100 },
            summary: { type: "string" },
            roadmap: {
              type: "array",
              items: {
                type: "object",
                required: ["phase", "focus", "recommended_projects"],
                properties: {
                  phase: { type: "string" },
                  focus: { type: "array", items: { type: "string" } },
                  recommended_projects: { type: "array", items: { type: "string" } },
                },
                additionalProperties: true,
              },
            },
          },
        },
      },
    });

    const text =
      (response as any)?.text ??
      (response as any)?.response?.text?.() ??
      (response as any)?.candidates?.[0]?.content?.parts?.map((p: any) => p?.text ?? "").join("") ??
      "";
    if (!text) throw new Error("Empty response from Gemini.");

    // 🧠 Safe JSON parsing
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      const match = text.match(/\{[\s\S]*\}/);
      if (match) parsed = JSON.parse(match[0]);
      else throw new Error("Invalid JSON response");
    }

    // Normalize expected fields so the UI doesn't crash on partial responses.
    parsed.skills ??= { strong: [], moderate: [], weak: [] };
    parsed.skills.strong ??= [];
    parsed.skills.moderate ??= [];
    parsed.skills.weak ??= [];
    parsed.missing_skills ??= [];
    parsed.skill_gaps ??= [];
    parsed.summary ??= "";
    parsed.roadmap ??= [];

    parsed.readiness_score =
      parseInt(String(parsed.readiness_score), 10) || 0;

    return NextResponse.json(parsed);

  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}