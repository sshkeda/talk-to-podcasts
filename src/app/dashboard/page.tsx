import Podcasts from "@/components/podcasts";
import UploadPodcast from "@/components/upload-podcast";
import { Suspense } from "react";

export default async function Dashboard() {
  return (
    <div>
      <div className="max-w-screen-lg mx-auto mt-3">
        <UploadPodcast />
        <Suspense fallback={null}>
          <Podcasts />
        </Suspense>
      </div>
    </div>
  );
}
