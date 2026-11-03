export type AuthInput = {
  email: string;
  password: string;
};

export function parseAuthInput(value: unknown): AuthInput | null {
  if (!value || typeof value !== "object") return null;

  const input = value as Record<string, unknown>;
  const email = typeof input.email === "string" ? input.email.trim().toLowerCase() : "";
  const password = typeof input.password === "string" ? input.password : "";

  if (!/^\S+@\S+\.\S+$/.test(email) || password.length < 8 || password.length > 128) {
    return null;
  }

  return { email, password };
}
