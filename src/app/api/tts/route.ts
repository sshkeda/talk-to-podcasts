import { env } from "@/env";
import { auth, isSignedIn } from "@/lib/edgedb";
import { createClient } from "@deepgram/sdk";
import { NextRequest } from "next/server";

export const revalidate = 0;

// https://developers.deepgram.com/docs/streaming-the-audio-output
export async function GET(request: NextRequest) {
  const { client } = auth();
  const authorized = await isSignedIn.run(client);
  if (!authorized) throw new Error("Unauthorized.");

  const text = request.nextUrl.searchParams.get("text");
  if (!text) throw new Error("Missing text.");

  const deepgram = createClient(env.DEEPGRAM_API_KEY);
  const response = await deepgram.speak.request(
    { text },
    {
      model: "aura-asteria-en",
    },
  );

  const stream = await response.getStream();

  if (!stream) throw new Error("Stream not found.");

  return new Response(stream, {
    headers: {
      "Content-Type": "audio/mpeg",
    },
  });
}
