export type SessionContextType = {
  token: string | null;
  userId: string | null;
  setSession: (token: string, userId: string) => void;
  clearSession: () => void;
};
