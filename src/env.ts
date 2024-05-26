import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DEEPGRAM_API_KEY: z.string().min(1),
    OPENAI_API_KEY: z.string().min(1),
    // GOOGLE_GENERATIVE_AI_API_KEY: z.string().min(1),
    EDGEDB_AUTH_BASE_URL: z.string().url(),
    EDBEDB_AUTH_REDIRECT_URL: z.string().url(),
    UPLOADTHING_SECRET: z.string().min(1),
    UPLOADTHING_APP_ID: z.string().min(1),
    BASE_URL: z.string().url(),
  },
  experimental__runtimeEnv: {},
});
