import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    AUTH_SECRET: z.string().min(1),
    AUTH_URL: z.string().url().optional(),
  },
  client: {},
  // Next.js inline les variables ; on les expose explicitement au runtime.
  experimental__runtimeEnv: {},
});
