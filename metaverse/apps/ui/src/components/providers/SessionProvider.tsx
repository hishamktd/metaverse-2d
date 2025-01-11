"use client";

import { createContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SessionContextType } from "@/types/session";
import { STORAGE_KEYS } from "@/constants/storage-keys";

const { TOKE, USER_ID } = STORAGE_KEYS;

export const SessionContext = createContext<SessionContextType | undefined>(
  undefined
);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem(TOKE);
    const storedUserId = localStorage.getItem(USER_ID);
    if (storedToken && storedUserId) {
      setToken(storedToken);
      setUserId(storedUserId);
    }
  }, []);

  const setSession = (newToken: string, newUserId: string) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("userId", newUserId);
    setToken(newToken);
    setUserId(newUserId);
    router.push("/spaces");
  };

  const clearSession = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    setToken(null);
    setUserId(null);
    router.push("/");
  };

  return (
    <SessionContext.Provider
      value={{ token, userId, setSession, clearSession }}
    >
      {children}
    </SessionContext.Provider>
  );
}
