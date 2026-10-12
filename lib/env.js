import { z } from 'zod';

const clientEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
});

const serverEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).optional(),
});

function validateEnv(schema, values, scope) {
  const result = schema.safeParse(values);

  if (!result.success) {
    const fields = result.error.issues.map((issue) => issue.path.join('.')).join(', ');
    throw new Error(`Invalid ${scope} environment variables: ${fields}`);
  }

  return result.data;
}

// NEXT_PUBLIC values are intentionally browser-safe. Never add credentials here.
export const publicEnv = validateEnv(clientEnvSchema, {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
}, 'public');

// Server-only secrets will be added here when a server integration requires them.
validateEnv(serverEnvSchema, {
  NODE_ENV: process.env.NODE_ENV,
}, 'server');
