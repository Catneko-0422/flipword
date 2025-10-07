declare const process: {
  env: Record<string, string | undefined>;
};

const DEFAULT_ADMIN_USERNAME = "admin";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function getAdminUsername(): string {
  return process.env.ADMIN_USERNAME ?? DEFAULT_ADMIN_USERNAME;
}

export function getAdminPasswordHash(): string | null {
  return process.env.ADMIN_PASSWORD_HASH ?? null;
}

export function getAdminPassword(): string | null {
  return process.env.ADMIN_PASSWORD ?? null;
}

export function getJwtSecret(): Uint8Array {
  const secret = requireEnv("ADMIN_JWT_SECRET");
  return new TextEncoder().encode(secret);
}

export function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

export function isKvEnabled(): boolean {
  return Boolean(process.env.KV_REST_API_URL);
}