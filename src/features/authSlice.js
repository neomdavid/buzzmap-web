import { createSlice } from "@reduxjs/toolkit";

// Debug function to check auth state on initialization
const getInitialAuthState = () => {
  const userFromLocal = localStorage.getItem("user");
  const userFromSession = sessionStorage.getItem("user");
  const tokenFromLocal = localStorage.getItem("token");
  const tokenFromSession = sessionStorage.getItem("token");
  const refreshFromLocal = localStorage.getItem("refreshToken");
  const refreshFromSession = sessionStorage.getItem("refreshToken");

  console.log("[DEBUG] Auth initialization check:", {
    userFromLocal: userFromLocal ? JSON.parse(userFromLocal) : null,
    userFromSession: userFromSession ? JSON.parse(userFromSession) : null,
    tokenFromLocal: !!tokenFromLocal,
    tokenFromSession: !!tokenFromSession,
    hasLocalStorage: !!userFromLocal && !!tokenFromLocal,
    hasSessionStorage: !!userFromSession && !!tokenFromSession,
  });

  const user = JSON.parse(userFromLocal || userFromSession) || null;
  const token = tokenFromLocal || tokenFromSession || null;
  const refreshToken = refreshFromLocal || refreshFromSession || null;
  const isAuthenticated = !!(token && user);

  return { user, token, refreshToken, isAuthenticated };
};

const initialState = getInitialAuthState();

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthCredentials: (state, action) => {
      const { user, token, refreshToken, rememberMe } = action.payload;

      console.log("[DEBUG] Setting auth credentials:", {
        userRole: user?.role,
        userName: user?.name,
        rememberMe,
        tokenExists: !!token,
      });

      // Update Redux state
      state.user = user;
      state.token = token;
      state.refreshToken = refreshToken || state.refreshToken || null;
      state.isAuthenticated = true;

      // Clear any existing auth data from both storages
      console.log("[DEBUG] Clearing existing storage data...");
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("refreshToken");

      // Store based on rememberMe preference
      if (rememberMe) {
        console.log("[DEBUG] Storing in localStorage for rememberMe=true");
        localStorage.setItem("token", token);
        if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("user", JSON.stringify(user));
      } else {
        console.log("[DEBUG] Storing in sessionStorage for rememberMe=false");
        sessionStorage.setItem("token", token);
        if (refreshToken) sessionStorage.setItem("refreshToken", refreshToken);
        sessionStorage.setItem("user", JSON.stringify(user));
      }

      // Verify storage was successful
      const storedUserLocal = localStorage.getItem("user");
      const storedTokenLocal = localStorage.getItem("token");
      const storedUserSession = sessionStorage.getItem("user");
      const storedTokenSession = sessionStorage.getItem("token");
      const storedRefreshLocal = localStorage.getItem("refreshToken");
      const storedRefreshSession = sessionStorage.getItem("refreshToken");

      console.log("[DEBUG] Auth storage verification:", {
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        storage: rememberMe ? "localStorage" : "sessionStorage",
        storedInLocal: !!storedUserLocal && !!storedTokenLocal,
        storedInSession: !!storedUserSession && !!storedTokenSession,
        localUser: storedUserLocal ? JSON.parse(storedUserLocal) : null,
        sessionUser: storedUserSession ? JSON.parse(storedUserSession) : null,
        hasRefreshLocal: !!storedRefreshLocal,
        hasRefreshSession: !!storedRefreshSession,
      });
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("refreshToken");
    },
    updateUser: (state, action) => {
      const updatedUserData = action.payload;

      // Update Redux state
      state.user = { ...state.user, ...updatedUserData };

      // Update storage - check which storage is being used
      const userFromLocal = localStorage.getItem("user");
      const userFromSession = sessionStorage.getItem("user");

      if (userFromLocal) {
        // Using localStorage
        localStorage.setItem("user", JSON.stringify(state.user));
      } else if (userFromSession) {
        // Using sessionStorage
        sessionStorage.setItem("user", JSON.stringify(state.user));
      }

      console.log("[DEBUG] User data updated:", state.user);
    },
  },
});

export const { setAuthCredentials, logout, updateUser } = authSlice.actions;
export default authSlice.reducer;
