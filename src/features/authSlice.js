import { createSlice } from "@reduxjs/toolkit";

// Debug function to check auth state on initialization
const getInitialAuthState = () => {
  const userFromLocal = localStorage.getItem("user");
  const userFromSession = sessionStorage.getItem("user");
  const tokenFromLocal = localStorage.getItem("token");
  const tokenFromSession = sessionStorage.getItem("token");
  
  console.log('[DEBUG] Auth initialization check:', {
    userFromLocal: userFromLocal ? JSON.parse(userFromLocal) : null,
    userFromSession: userFromSession ? JSON.parse(userFromSession) : null,
    tokenFromLocal: !!tokenFromLocal,
    tokenFromSession: !!tokenFromSession,
    hasLocalStorage: !!userFromLocal && !!tokenFromLocal,
    hasSessionStorage: !!userFromSession && !!tokenFromSession
  });
  
  const user = JSON.parse(userFromLocal || userFromSession) || null;
  const token = tokenFromLocal || tokenFromSession || null;
  const isAuthenticated = !!(token && user);
  
  return { user, token, isAuthenticated };
};

const initialState = getInitialAuthState();

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthCredentials: (state, action) => {
      const { user, token, rememberMe } = action.payload;
      
      console.log('[DEBUG] Setting auth credentials:', {
        userRole: user?.role,
        userName: user?.name,
        rememberMe,
        tokenExists: !!token
      });
      
      // Update Redux state
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      
      // Clear any existing auth data from both storages
      console.log('[DEBUG] Clearing existing storage data...');
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("token");
      
      // Store based on rememberMe preference
      if (rememberMe) {
        console.log('[DEBUG] Storing in localStorage for rememberMe=true');
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
      } else {
        console.log('[DEBUG] Storing in sessionStorage for rememberMe=false');
        sessionStorage.setItem("token", token);
        sessionStorage.setItem("user", JSON.stringify(user));
      }
      
      // Verify storage was successful
      const storedUserLocal = localStorage.getItem("user");
      const storedTokenLocal = localStorage.getItem("token");
      const storedUserSession = sessionStorage.getItem("user");
      const storedTokenSession = sessionStorage.getItem("token");
      
      console.log('[DEBUG] Auth storage verification:', {
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        storage: rememberMe ? 'localStorage' : 'sessionStorage',
        storedInLocal: !!storedUserLocal && !!storedTokenLocal,
        storedInSession: !!storedUserSession && !!storedTokenSession,
        localUser: storedUserLocal ? JSON.parse(storedUserLocal) : null,
        sessionUser: storedUserSession ? JSON.parse(storedUserSession) : null
      });
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("token");
    },
  },
});

export const { setAuthCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
