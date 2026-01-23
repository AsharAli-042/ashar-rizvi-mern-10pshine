import React, { createContext, useEffect, useMemo, useState } from "react";
import { authApi } from "../api/auth.api";
import { usersApi } from "../api/users.api";
import { clearToken, getToken, getUser, setToken, setUser } from "../utils/storage";

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [tokenState, setTokenState] = useState(getToken());
  const [userState, setUserState] = useState(getUser());
  const [initializing, setInitializing] = useState(false);

  // Pull any “session expired” message set by the API client
  const [authMessage, setAuthMessage] = useState(() => {
    const msg = sessionStorage.getItem("auth_message");
    if (msg) sessionStorage.removeItem("auth_message");
    return msg || "";
  });

  const isAuthenticated = !!tokenState;

  useEffect(() => {
    let ignore = false;

    async function hydrate() {
      if (!tokenState || userState) return;
      setInitializing(true);
      try {
        const me = await usersApi.me();
        if (!ignore) {
          setUser(me);
          setUserState(me);
        }
      } catch {
        // 401 is handled globally by interceptor; no need to do more here
      } finally {
        if (!ignore) setInitializing(false);
      }
    }

    hydrate();
    return () => {
      ignore = true;
    };
  }, [tokenState, userState]);

  async function register({ name, email, password }) {
    const data = await authApi.register({ name, email, password });
    setToken(data.token);
    setUser(data.user);
    setTokenState(data.token);
    setUserState(data.user);
    return data.user;
  }

  async function login({ email, password }) {
    const data = await authApi.login({ email, password });
    setToken(data.token);
    setUser(data.user);
    setTokenState(data.token);
    setUserState(data.user);
    return data.user;
  }

  async function logout({ callApi = false } = {}) {
    if (callApi) {
      try {
        await authApi.logout();
      } catch {
        // ignore; backend logout is optional/stateless
      }
    }
    clearToken();
    setTokenState(null);
    setUserState(null);
  }

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
    }),
    [tokenState, userState, isAuthenticated, initializing, authMessage]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
