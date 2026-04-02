import { NextRequest, NextResponse } from "next/server";
import { mongoClientPromise } from "@/lib/mongodb";
import {
  AUTH_COOKIE_NAME,
  signSessionToken,
  verifyPassword,
} from "@/lib/auth";

type Body = {
  email?: string;
  password?: string;
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Body;
    const email = (body.email ?? "").trim().toLowerCase();
    const password = body.password ?? "";

    if (!email || !password) {
      return NextResponse.json(
        { error: "email and password are required." },
        { status: 400 }
      );
    }

    const client = await mongoClientPromise;
    const db = client.db();
    const users = db.collection("users");

    const user = await users.findOne(
      { email },
      { projection: { email: 1, name: 1, passwordHash: 1 } }
    );
    if (!user || typeof (user as any).passwordHash !== "string") {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }

    const ok = await verifyPassword(password, (user as any).passwordHash);
    if (!ok) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }

    const token = signSessionToken({ userId: String((user as any)._id), email });
    const res = NextResponse.json({
      ok: true,
      user: { id: String((user as any)._id), email, name: (user as any).name ?? "" },
    });
    res.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Login failed." },
      { status: 500 }
    );
  }
}

