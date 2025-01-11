import SpaceCanvas from "@/components/SpaceCanvas";
import { Suspense } from "react";

export default function SpacePage({ params }: { params: { id: string } }) {
  return (
    <main className="min-h-screen bg-gray-100">
      <Suspense fallback={<div>Loading...</div>}>
        <SpaceCanvas spaceId={params.id} />
      </Suspense>
    </main>
  );
}
