import { auth, e, isSignedIn } from "@/lib/edgedb";
import { openai } from "@/lib/openai";
import { revalidatePath } from "next/cache";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { UTApi } from "uploadthing/server";

export const utapi = new UTApi();
const f = createUploadthing();

const CHUNK_SIZE = 20 * 1024 * 1024;

async function splitArrayBuffer(arrayBuffer: ArrayBuffer) {
  const bytes = arrayBuffer.byteLength;
  const chunks: File[] = [];
  let start = 0;
  let part = 0;

  while (start < bytes) {
    const end = Math.min(start + CHUNK_SIZE, bytes);
    const chunkData = arrayBuffer.slice(start, end);
    const fileName = `file_part${part}.mp3`;

    const chunk = new File([chunkData], fileName, { type: "audio/mpeg" });
    chunks.push(chunk);

    start = end;
    part += 1;
  }

  return chunks;
}

export type Transcription = {
  start: number;
  end: number;
  text: string;
};

export const ourFileRouter = {
  audioUploader: f({ "audio/mpeg": { maxFileSize: "512MB" } })
    .middleware(async () => {
      const { client, auth_token } = auth();

      const signedIn = await isSignedIn.run(client);
      if (!signedIn) throw new UploadThingError("Unauthorized");

      return {
        auth_token: auth_token as string,
      };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const { client } = auth(metadata.auth_token);

      const response = await fetch(file.url);
      const arrayBuffer = await response.arrayBuffer();

      // Split the file into 20MB chunks
      const chunks = await splitArrayBuffer(arrayBuffer);

      const transcriptions = await Promise.all(
        chunks.map(async (file) => {
          return await openai.audio.transcriptions.create({
            file,
            language: "en",
            model: "whisper-1",
            response_format: "verbose_json",
            timestamp_granularities: ["segment"],
          });
        }),
      );

      const transcription: Transcription[] = [];

      let durationProcessed = 0;
      transcriptions.forEach(({ segments, duration }: any) => {
        transcription.push(
          ...segments.map(({ start, end, text }: Transcription) => {
            return {
              start: durationProcessed + parseInt(start.toString()),
              end: durationProcessed + parseInt(end.toString()),
              text,
            };
          }),
        );

        durationProcessed += duration;
      });

      const { id } = await e
        .insert(e.Podcast, {
          name: file.name,
          url: file.url,
          bytes: file.size,
          key: file.key,
          transcription: JSON.stringify(transcription),
        })
        .run(client);

      revalidatePath("/dashboard");

      return { id };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
