import { NextRequest, NextResponse } from "next/server";
import { mongoClientPromise } from "@/lib/mongodb";
import { hashPassword, signSessionToken, AUTH_COOKIE_NAME } from "@/lib/auth";

type Body = {
  email?: string;
  password?: string;
  name?: string;
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Body;
    const email = (body.email ?? "").trim().toLowerCase();
    const password = body.password ?? "";
    const name = (body.name ?? "").trim();

    if (!email || !password) {
      return NextResponse.json(
        { error: "email and password are required." },
        { status: 400 }
      );
    }
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    const client = await mongoClientPromise;
    const db = client.db();
    const users = db.collection("users");

    await users.createIndex({ email: 1 }, { unique: true });

    const existing = await users.findOne({ email }, { projection: { _id: 1 } });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const createdAt = new Date();

    const insertRes = await users.insertOne({
      email,
      name,
      passwordHash,
      createdAt,
    });

    const token = signSessionToken({ userId: String(insertRes.insertedId), email });

    const res = NextResponse.json({
      ok: true,
      user: { id: String(insertRes.insertedId), email, name },
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
    const msg = typeof err?.message === "string" ? err.message : "Signup failed.";
    if (msg.includes("E11000")) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

