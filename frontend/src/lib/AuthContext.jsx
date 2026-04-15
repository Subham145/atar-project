import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";
import { authAPI } from "@/api/auth";

/**
 * @typedef {{ [key: string]: any } | null} AuthUser
 */

/**
 * @typedef {{
 *   type: string,
 *   message?: string,
 *   [key: string]: any
 * } | null} AuthError
 */

/**
 * @typedef {{
 *   token: string,
 *   user: AuthUser,
 *   [key: string]: any
 * }} AuthData
 */

/**
 * @typedef {{
 *   user: AuthUser,
 *   isAuthenticated: boolean,
 *   isLoadingAuth: boolean,
 *   isLoadingPublicSettings: boolean,
 *   authError: AuthError,
 *   login: (authData: AuthData) => Promise<void>,
 *   logout: () => void,
 *   navigateToLogin: () => void,
 *   checkAppState: () => Promise<void>
 * }} AuthContextValue
 */

/**
 * @typedef {{
 *   children?: import("react").ReactNode
 * }} AuthProviderProps
 */

const AuthContext = createContext(/** @type {AuthContextValue | null} */ (null));

/**
 * @param {AuthProviderProps} props
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(/** @type {AuthUser} */ (null));
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(() =>
    Boolean(localStorage.getItem("token"))
  );
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState(/** @type {AuthError} */ (null));

  const checkAppState = useCallback(async () => {
    if (!token) {
      setIsLoadingPublicSettings(false);
      setIsLoadingAuth(false);
      setIsAuthenticated(false);
      setUser(null);
      return;
    }

    try {
      setIsLoadingAuth(true);
      const userData = await authAPI.me(token);
      setUser(userData);
      setIsAuthenticated(true);
      setAuthError(null);
    } catch (error) {
      localStorage.removeItem("token");
      setToken(null);
      setIsAuthenticated(false);
      setUser(null);
      setAuthError({ type: "auth_required" });
    } finally {
      setIsLoadingPublicSettings(false);
      setIsLoadingAuth(false);
    }
  }, [token]);

  useEffect(() => {
    checkAppState();
  }, [checkAppState]);

  const login = useCallback(
    /**
     * @param {AuthData} authData
     */
    async (authData) => {
      const { token: nextToken, user } = authData;
      localStorage.setItem("token", nextToken);
      setToken(nextToken);
      setUser(user);
      setIsAuthenticated(true);
      setAuthError(null);
    },
    []
  );

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    setAuthError(null);
  };

  const navigateToLogin = () => {
    console.log("Redirecting to login...");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoadingAuth,
        isLoadingPublicSettings,
        authError,
        login,
        logout,
        navigateToLogin,
        checkAppState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
