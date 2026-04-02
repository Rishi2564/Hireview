import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, verifySessionToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
    if (!token) return NextResponse.json({ user: null }, { status: 200 });
    const payload = verifySessionToken(token);
    return NextResponse.json(
      { user: { id: payload.userId, email: payload.email } },
      { status: 200 }
    );
  } catch {
    return NextResponse.json({ user: null }, { status: 200 });
  }
}

