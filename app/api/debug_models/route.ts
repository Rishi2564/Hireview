import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function GET() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

    const models = await genAI.listModels();

    return NextResponse.json(models);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}