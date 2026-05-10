import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { authService, getToken, isAuthenticated, removeToken } from "@/services";
import type { UserDto, UserRole } from "@/types";

interface AuthContextType {
  user: UserDto | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  hasRole: (...roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Public routes that don't require auth
const PUBLIC_ROUTES = ["/login"];

// Routes allowed even when mustChangePassword is true
const CHANGE_PASSWORD_ROUTE = "/change-password";

// Role → default landing page
const ROLE_LANDING: Record<string, string> = {
  ADMIN: "/setup",
  CHEF_DEP: "/setup",
  CHEF_HE: "/setup",
  CHEF_ST: "/setup",
  ETUDIANT: "/etudiant/emploi-du-temps",
  PROFESSEUR: "/professeur/emploi-du-temps",
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const isLoggedIn = !!user && isAuthenticated();

  // Fetch current user from /api/auth/me
  const refreshUser = useCallback(async () => {
    if (!getToken()) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    try {
      const me = await authService.me();
      setUser(me);
    } catch {
      removeToken();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // On mount, check if we have a valid token
  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  // Route guard: redirect if needed
  useEffect(() => {
    if (isLoading) return;

    const isPublic = PUBLIC_ROUTES.includes(location.pathname);
    const isChangePassword = location.pathname === CHANGE_PASSWORD_ROUTE;

    if (!isLoggedIn && !isPublic) {
      // Not logged in and trying to access a protected route
      navigate("/login", { replace: true });
      return;
    }

    if (isLoggedIn && user?.mustChangePassword) {
      // User must change their password first
      if (!isChangePassword) {
        navigate(CHANGE_PASSWORD_ROUTE, { replace: true });
      }
      return;
    }
  }, [isLoading, isLoggedIn, location.pathname, navigate, user]);

  const login = useCallback(async (email: string, password: string) => {
    await authService.login({ email, password });
    const me = await authService.me();
    setUser(me);

    // If user must change password, redirect there
    if (me.mustChangePassword) {
      navigate(CHANGE_PASSWORD_ROUTE, { replace: true });
      return;
    }

    // Role-based redirect
    const landing = ROLE_LANDING[me.role] || "/";
    navigate(landing, { replace: true });
  }, [navigate]);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    navigate("/login", { replace: true });
  }, [navigate]);

  const hasRole = useCallback((...roles: UserRole[]) => {
    if (!user) return false;
    return roles.includes(user.role as UserRole);
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, isLoading, isLoggedIn, login, logout, refreshUser, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}

export default useAuth;
