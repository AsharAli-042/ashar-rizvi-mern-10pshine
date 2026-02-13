import React, { useEffect, useMemo, useState, useCallback } from "react";
import { AuthContext } from "./AuthContext"; // Ensure this is a named import
import { authApi } from "../api/auth.api";
import { usersApi } from "../api/users.api";
import { clearToken, getToken, getUser, setToken, setUser } from "../utils/storage";

export function AuthProvider({ children }) {
  const [tokenState, setTokenState] = useState(getToken());
  const [userState, setUserState] = useState(getUser());
  const [initializing, setInitializing] = useState(false);

  const [authMessage, setAuthMessage] = useState(() => {
    const msg = sessionStorage.getItem("auth_message");
    if (msg) sessionStorage.removeItem("auth_message");
    return msg || "";
  });

  const isAuthenticated = !!tokenState;

  const logout = useCallback(async () => {
    if (tokenState) {
      try {
        await authApi.logout();
      } catch {
        // ignore
      }
    }
    clearToken();
    setTokenState(null);
    setUserState(null);
  }, [tokenState]);

  useEffect(() => {
    let ignore = false;
    async function hydrate() {
      if (!tokenState || userState) return;
      setInitializing(true);
      try {
        const me = await usersApi.getMe();
        if (!ignore) setUserState(me);
      } catch {
        if (!ignore) logout();
      } finally {
        if (!ignore) setInitializing(false);
      }
    }
    hydrate();
    return () => { ignore = true; };
  }, [tokenState, userState, logout]); // Added logout here

  const register = useCallback(async (credentials) => {
    const { token, user } = await authApi.register(credentials);
    setToken(token);
    setUser(user);
    setTokenState(token);
    setUserState(user);
  }, []);

  const login = useCallback(async (credentials) => {
    const { token, user } = await authApi.login(credentials);
    setToken(token);
    setUser(user);
    setTokenState(token);
    setUserState(user);
  }, []);

  const updateUser = useCallback((nextUser) => {
    setUser(nextUser);
    setUserState(nextUser);
  }, []);

  const value = useMemo(
    () => ({
      token: tokenState,
      user: userState,
      isAuthenticated,
      initializing,
      authMessage,
      setAuthMessage,
      register,
      login,
      logout,
      updateUser,
    }),
    [
      tokenState,
      userState,
      isAuthenticated,
      initializing,
      authMessage,
      register,
      login,
      logout,
      updateUser,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;