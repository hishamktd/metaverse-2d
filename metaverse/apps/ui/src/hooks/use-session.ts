import { useContext } from "react";
import { SessionContext } from "../components/providers/SessionProvider";

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within SessionProvider");
  }
  return context;
};
