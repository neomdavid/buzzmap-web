import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toastError } from "../utils.jsx";
import { useSessionValidation } from "../hooks/useSessionValidation";
import { logout } from "../features/authSlice";
import { handleAccountDisabledError } from "../utils/accountStatusHandler";

/**
 * AuthGuard component that provides session validation for admin/superadmin routes
 * This component automatically logs out users whose accounts have been disabled
 */
const AuthGuard = ({ children, requiredRole }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth?.user);
  const token = useSelector((state) => state.auth?.token);

  // Use session validation hook for admin/superadmin users
  const isAdmin = user?.role === "admin" || user?.role === "superadmin";
  useSessionValidation(isAdmin ? 30000 : 0); // 30 seconds for admin users

  // Handle account disabled errors from API calls
  useEffect(() => {
    const handleAccountDisabled = (event) => {
      if (event.detail?.status === "ACCOUNT_DISABLED") {
        console.log("[AuthGuard] Account disabled event received");
        handleAccountDisabledError(dispatch, navigate, event.detail?.message);
      }
    };

    // Listen for custom account disabled events
    window.addEventListener("accountDisabled", handleAccountDisabled);

    return () => {
      window.removeEventListener("accountDisabled", handleAccountDisabled);
    };
  }, [dispatch, navigate]);

  // Handle immediate logout if no valid session
  useEffect(() => {
    if (!user || !token) {
      console.log("[AuthGuard] No valid session, redirecting to login");
      navigate("/login", { replace: true });
      return;
    }

    // Check role requirements
    if (requiredRole && user.role !== requiredRole) {
      console.log("[AuthGuard] Role mismatch, redirecting to login");
      toastError("You don't have permission to access this page.");
      navigate("/login", { replace: true });
      return;
    }
  }, [user, token, requiredRole, navigate]);

  return children;
};

export default AuthGuard;
