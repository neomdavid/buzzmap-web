import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: JSON.parse(localStorage.getItem("user") || sessionStorage.getItem("user")) || null,
  token: localStorage.getItem("token") || sessionStorage.getItem("token") || null,
  isAuthenticated: !!(localStorage.getItem("token") || sessionStorage.getItem("token")),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthCredentials: (state, action) => {
      const { user, token, rememberMe } = action.payload;
      
      // Update Redux state
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      
      // Clear any existing auth data
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("token");
      
      // Store based on rememberMe preference
      if (rememberMe) {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
      } else {
        sessionStorage.setItem("token", token);
        sessionStorage.setItem("user", JSON.stringify(user));
      }
      
      console.log('[DEBUG] Auth state updated:', {
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        storage: rememberMe ? 'localStorage' : 'sessionStorage'
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
