import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";
import { ROUTES } from "../constants";

/**
 * Custom hook for authentication logic
 */
export const useAuth = () => {
  const { user, isAuthenticated, fetchProfile } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && !user) {
      fetchProfile();
    }
  }, [isAuthenticated, user, fetchProfile]);

  return { user, isAuthenticated };
};

/**
 * Hook to protect routes - redirect to login if not authenticated
 */
export const useRequireAuth = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN, { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return { isAuthenticated };
};

/**
 * Hook to redirect authenticated users away from auth pages
 */
export const useRedirectIfAuthenticated = (redirectTo = ROUTES.HOME) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, navigate, redirectTo]);
};
