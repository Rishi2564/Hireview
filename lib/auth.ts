import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const AUTH_COOKIE_NAME = "hireview_session";

export function requireJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  console.log("ENV CHECK:", process.env.JWT_SECRET);
  if (!secret) throw new Error("Missing JWT_SECRET in environment.");
  return secret;
}

export async function hashPassword(password: string) {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

export async function verifyPassword(password: string, passwordHash: string) {
  return bcrypt.compare(password, passwordHash);
}

export function signSessionToken(payload: { userId: string; email: string }) {
  const secret = requireJwtSecret();
  return jwt.sign(payload, secret, { expiresIn: "7d" });
}

export function verifySessionToken(token: string) {
  const secret = requireJwtSecret();
  return jwt.verify(token, secret) as { userId: string; email: string; iat: number; exp: number };
}

