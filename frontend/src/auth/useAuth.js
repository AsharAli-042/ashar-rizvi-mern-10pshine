import { useContext } from "react";
import { AuthContext } from "./AuthContext"; // Must match the named export above

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};