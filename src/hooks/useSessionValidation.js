import { useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toastError } from "../utils.jsx";
import { useGetAccountsQuery } from "../api/dengueApi";
import { logout } from "../features/authSlice";

/**
 * Custom hook for validating user session and account status
 * This hook periodically checks if the current user's account is still active
 * and automatically logs out disabled users
 */
export const useSessionValidation = (interval = 30000) => {
  // Default 30 seconds
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth?.user);
  const token = useSelector((state) => state.auth?.token);
  const intervalRef = useRef(null);
  const isAdmin = user?.role === "admin" || user?.role === "superadmin";

  // Only validate for admin/superadmin users
  const { data: accounts, refetch } = useGetAccountsQuery(undefined, {
    skip: !isAdmin || !user?.email,
    pollingInterval: interval,
    refetchOnMountOrArgChange: true,
  });

  const validateAccountStatus = () => {
    if (!isAdmin || !user?.email || !accounts) return;

    // Find current user in accounts list
    const currentUserAccount = accounts.find(
      (account) => account.email === user.email && account._id === user._id
    );

    if (currentUserAccount) {
      // Check if account is disabled
      if (currentUserAccount.status === "disabled") {
        console.log("[SESSION_VALIDATION] Account disabled, logging out user");

        // Clear auth data
        dispatch(logout());

        // Show error message
        toastError(
          "Your account has been disabled. Please contact an administrator."
        );

        // Redirect to login
        navigate("/login", { replace: true });
        return false;
      }
    } else {
      // Account not found in active accounts (might be deleted)
      console.log("[SESSION_VALIDATION] Account not found, logging out user");

      // Clear auth data
      dispatch(logout());

      // Show error message
      toastError(
        "Your account is no longer available. Please contact an administrator."
      );

      // Redirect to login
      navigate("/login", { replace: true });
      return false;
    }

    return true;
  };

  useEffect(() => {
    if (!isAdmin || !user?.email) return;

    // Initial validation
    validateAccountStatus();

    // Set up periodic validation
    intervalRef.current = setInterval(() => {
      validateAccountStatus();
    }, interval);

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isAdmin, user?.email, accounts, interval]);

  // Return validation function for manual checks
  return { validateAccountStatus };
};
