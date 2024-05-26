"use client";

import { buttonVariants } from "@/components/ui/button";
import { UploadButton } from "@/lib/utils";
import { useRouter } from "next/navigation";

export default function UploadPodcast() {
  const router = useRouter();

  return (
    <UploadButton
      endpoint="audioUploader"
      onClientUploadComplete={([upload]) => {
        router.push(`/dashboard/${upload.serverData.id}`);
      }}
      content={{
        button: "Upload Podcast",
      }}
      appearance={{
        container: "block",
        button: buttonVariants({
          variant: "outline",
        }),
        allowedContent: "hidden",
      }}
    />
  );
}
