import { createSlice } from "@reduxjs/toolkit";

// Debug function to check auth state on initialization
const getInitialAuthState = () => {
  const userFromLocal = localStorage.getItem("user");
  const userFromSession = sessionStorage.getItem("user");
  const tokenFromLocal = localStorage.getItem("token");
  const tokenFromSession = sessionStorage.getItem("token");
  const refreshFromLocal = localStorage.getItem("refreshToken");
  const refreshFromSession = sessionStorage.getItem("refreshToken");

  const user = JSON.parse(userFromLocal || userFromSession) || null;
  const token = tokenFromLocal || tokenFromSession || null;
  const refreshToken = refreshFromLocal || refreshFromSession || null;
  const isAuthenticated = !!(token && user);

  console.log("[AUTH DEBUG] Initial auth state:", {
    userFromLocal,
    userFromSession,
    tokenFromLocal,
    tokenFromSession,
    user,
    token,
    isAuthenticated,
  });

  return { user, token, refreshToken, isAuthenticated };
};

const initialState = getInitialAuthState();

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthCredentials: (state, action) => {
      const { user, token, refreshToken, rememberMe } = action.payload;

      console.log("[AUTH DEBUG] Setting auth credentials:", {
        user: user?.name,
        role: user?.role,
        rememberMe,
        hasToken: !!token,
      });

      // Update Redux state
      state.user = user;
      state.token = token;
      state.refreshToken = refreshToken || state.refreshToken || null;
      state.isAuthenticated = true;

      // Clear any existing auth data from both storages
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("refreshToken");

      // Store based on rememberMe preference
      if (rememberMe) {
        localStorage.setItem("token", token);
        if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("user", JSON.stringify(user));
        console.log("[AUTH DEBUG] Stored in localStorage");
      } else {
        sessionStorage.setItem("token", token);
        if (refreshToken) sessionStorage.setItem("refreshToken", refreshToken);
        sessionStorage.setItem("user", JSON.stringify(user));
        console.log("[AUTH DEBUG] Stored in sessionStorage");
      }

      // Verify storage was successful
      const storedUserLocal = localStorage.getItem("user");
      const storedTokenLocal = localStorage.getItem("token");
      const storedUserSession = sessionStorage.getItem("user");
      const storedTokenSession = sessionStorage.getItem("token");
      const storedRefreshLocal = localStorage.getItem("refreshToken");
      const storedRefreshSession = sessionStorage.getItem("refreshToken");

      console.log("[AUTH DEBUG] Storage verification:", {
        storedUserLocal: !!storedUserLocal,
        storedTokenLocal: !!storedTokenLocal,
        storedUserSession: !!storedUserSession,
        storedTokenSession: !!storedTokenSession,
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
    },
  },
});

export const { setAuthCredentials, logout, updateUser } = authSlice.actions;
export default authSlice.reducer;
