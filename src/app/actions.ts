"use server";

import { env } from "@/env";
import { createClient } from "@deepgram/sdk";
import crypto from "node:crypto";

export async function getDeepgramKey() {
  // Default role
  return env.DEEPGRAM_API_KEY;

  // if (process.env.NODE_ENV === "development") {
  //   return env.DEEPGRAM_API_KEY;
  // }

  // const deepgram = createClient(env.DEEPGRAM_API_KEY);

  // const { result: projectsResult, error: projectsError } =
  //   await deepgram.manage.getProjects();
  // if (projectsError) throw new Error(projectsError.message);

  // const project = projectsResult?.projects[0];
  // if (!project) throw new Error("No projects found.");

  // const { result: newKeyResult, error: newKeyError } =
  //   await deepgram.manage.createProjectKey(project.project_id, {
  //     comment: "Temporary API key",
  //     scopes: ["usage:write"],
  //     tags: ["next.js"],
  //     time_to_live_in_seconds: 60 * 60 * 60,
  //   });
  // if (newKeyError) throw new Error(newKeyError.message);

  // return newKeyResult.key;
}

export async function generatePKCE() {
  const verifier = crypto.randomBytes(32).toString("base64url");

  const challenge = crypto
    .createHash("sha256")
    .update(verifier)
    .digest("base64url");

  return { verifier, challenge };
}
