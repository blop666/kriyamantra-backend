const requiredEnv = (name: "NEXT_PUBLIC_SUPABASE_URL" | "NEXT_PUBLIC_SUPABASE_ANON_KEY") => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
};

export const supabaseConfig = () => ({
  url: requiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
  anonKey: requiredEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
});
