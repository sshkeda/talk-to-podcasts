import { CoreMessage, StreamingTextResponse, streamText } from "ai";
import { z } from "zod";
import { openai } from "@ai-sdk/openai";
import { auth, e } from "@/lib/edgedb";

const bodySchema = z.object({
  transcribe: z.boolean(),
  podcastId: z.string(),
  position: z.number(),
  duration: z.number(),
  bytes: z.number(),
  transcription: z.array(
    z.object({
      start: z.number(),
      end: z.number(),
      text: z.string(),
    }),
  ),
  audioUrl: z.string().url(),
});

export type Body = z.infer<typeof bodySchema>;

export async function POST(request: Request) {
  const json = await request.json();
  const messages = json.messages as CoreMessage[];
  const chatHistory = JSON.parse(JSON.stringify(messages)) as CoreMessage[]; // Create a copy
  const prompt = messages[messages.length - 1].content as string;

  const {
    transcribe,
    podcastId,
    duration,
    bytes,
    transcription,
    audioUrl,
    position,
  } = bodySchema.parse(json);

  // const startBytes = Math.floor(
  //   (Math.max(0, position - 60) / duration) * bytes,
  // );

  // const endBytes = Math.floor(
  //   (Math.min(duration, position + 60) / duration) * bytes,
  // );

  // const audio = await response.arrayBuffer();
  // const audioSlice = audio.slice(startBytes, endBytes);
  // const base64 = Buffer.from(audioSlice).toString("base64");

  // messages[messages.length - 1] = {
  //   role: "user",
  //   content: [
  //     {
  //       type: "text",
  //       text: prompt,
  //     },
  //     {
  //       type: "image",
  //       mimeType: "audio/mp3",
  //       image: base64,
  //     },
  //   ],
  // };

  const transcriptionText = transcription
    .filter(
      (s) =>
        Math.abs(s.start - position) <= 40 && Math.abs(s.end - position) <= 30,
    )
    .map((s) => s.text)
    .join("");

  messages[messages.length - 1] = {
    role: "user",
    content: `Full transcription:\n"""${transcription.map((s) => s.text).join("")}"""\n\nCurrent context:\n"""${transcriptionText}"""\n\nUser message:\n"""${prompt}"""`,
  };

  const result = await streamText({
    model: openai("gpt-4o"),
    // model: google("gemini-1.5-flash-latest"),
    system: `You are a podcast AI Assistant. You will be given the full podcast transcription, current context that the user is referring to, and the user's message. Strive to respond in concise one-sentence responses.`,
    messages,
  });

  const stream = result.toAIStream({
    async onFinal(completion) {
      chatHistory.push({
        role: "assistant",
        content: completion,
      });

      const { client } = auth();
      await e
        .update(e.Podcast, () => ({
          filter_single: {
            id: podcastId,
          },
          set: {
            messages: JSON.stringify(chatHistory),
          },
        }))
        .run(client);
    },
  });

  return new StreamingTextResponse(stream);
}
