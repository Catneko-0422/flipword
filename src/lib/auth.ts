import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import {
  getAdminPassword,
  getAdminPasswordHash,
  getAdminUsername,
  getJwtSecret,
  isProduction,
} from "@/lib/env";
import type { SessionTokenPayload } from "@/lib/types";

const SESSION_COOKIE_NAME = "flipword_admin_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days
const ADMIN_SUBJECT = "admin";

function getFallbackPassword(): string {
  return "admin";
}

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function ensurePasswordHash(): Promise<string> {
  const envHash = getAdminPasswordHash();
  if (envHash) {
    return envHash;
  }
  const raw = getAdminPassword() ?? getFallbackPassword();
  return hashPassword(raw);
}

export async function verifyAdminCredentials(
  username: string,
  password: string,
): Promise<boolean> {
  const expectedUser = getAdminUsername();
  if (username !== expectedUser) return false;

  const envHash = getAdminPasswordHash();
  if (envHash) {
    return bcrypt.compare(password, envHash);
  }

  const envPassword = getAdminPassword();
  if (envPassword) {
    return password === envPassword;
  }

  return password === getFallbackPassword();
}

export async function createSessionToken(): Promise<string> {
  const secret = getJwtSecret();
  const jwt = await new SignJWT({})
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(ADMIN_SUBJECT)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(secret);
  return jwt;
}

export async function verifySessionToken(
  token: string,
): Promise<SessionTokenPayload | null> {
  try {
    const secret = getJwtSecret();
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ["HS256"],
      subject: ADMIN_SUBJECT,
    });
    return {
      sub: (payload.sub ?? ADMIN_SUBJECT) as SessionTokenPayload["sub"],
      iat: payload.iat ?? 0,
      exp: payload.exp ?? 0,
    };
  } catch {
    return null;
  }
}

function buildCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: isProduction(),
    path: "/",
    maxAge,
  };
}

export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(
    SESSION_COOKIE_NAME,
    token,
    buildCookieOptions(SESSION_MAX_AGE),
  );
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getCurrentSession(): Promise<SessionTokenPayload | null> {
  const bag = await cookies();
  const token = bag.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function requireAdmin(): Promise<void> {
  const session = await getCurrentSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
}

export function getSessionCookieName(): string {
  return SESSION_COOKIE_NAME;
}