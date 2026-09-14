import { z } from 'zod';

const envSchema = z.object({
  EXPO_PUBLIC_SUPABASE_URL: z.string().url(),
  EXPO_PUBLIC_SUPABASE_ANON_KEY: z.string().min(20),
});

const parsed = envSchema.safeParse({
  EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
  EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
});

/**
 * Supabase is optional at boot so the app stays runnable (demo/mock feed)
 * before a real project is wired up. Anything that needs a live backend
 * must check `isSupabaseConfigured` first rather than assuming `env` exists.
 */
export const isSupabaseConfigured = parsed.success;

export const env = parsed.success ? parsed.data : null;

if (!parsed.success && __DEV__) {
  const issues = parsed.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`).join('\n');
  console.warn(
    `[finzy] Supabase env vars missing/invalid — running in local demo mode.\n${issues}\n` +
      `Copy .env.example to .env.local and fill in your Supabase project values to enable live auth/data.`
  );
}

// Only the anon/publishable key ever lives here. The service-role key must
// never be referenced from client code or an EXPO_PUBLIC_ variable.
