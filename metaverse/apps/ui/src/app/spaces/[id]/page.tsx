import SpaceCanvas from "@/components/SpaceCanvas";
import { Suspense, use } from "react";

type Params = { id: string };

type SpacePageProps = {
  params: Promise<Params>;
};

export default function SpacePage({ params }: SpacePageProps) {
  const { id } = use(params);

  return (
    <main className="min-h-screen bg-gray-100">
      <Suspense fallback={<div>Loading...</div>}>
        <SpaceCanvas spaceId={id} />
      </Suspense>
    </main>
  );
}
