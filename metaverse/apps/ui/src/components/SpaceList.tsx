"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { Space } from "@/types/space";
import { useSession } from "@/hooks/use-session";

export default function SpaceList() {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const { token } = useSession();

  useEffect(() => {
    const fetchSpaces = async () => {
      try {
        const response = await axios.get("/api/v1/space/all", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSpaces(response.data.spaces);
      } catch (error) {
        console.error("Failed to fetch spaces:", error);
      }
    };

    if (token) {
      fetchSpaces();
    }
  }, [token]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {spaces.map((space) => (
        <Link
          key={space.id}
          href={`/spaces/${space.id}`}
          className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <div className="p-6">
            <h3 className="text-xl font-semibold mb-2">{space.name}</h3>
            <p className="text-gray-600">Dimensions: {space.dimensions}</p>
            <p className="text-gray-600">Elements: {space.elements.length}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
