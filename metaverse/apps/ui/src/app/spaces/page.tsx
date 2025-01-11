import SpaceList from "@/components/SpaceList";
import CreateSpaceButton from "@/components/CreateSpaceButton";

export default function SpacesPage() {
  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Spaces</h1>
          <CreateSpaceButton />
        </div>
        <SpaceList />
      </div>
    </main>
  );
}
