import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: JSON.parse(localStorage.getItem("user")) || null,
  // Directly access token as a string
  token: localStorage.getItem("token") || null,
  isAuthenticated: !!localStorage.getItem("token"),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user } = action.payload;
      state.user = user;
      localStorage.setItem("user", JSON.stringify(user));
      console.log(user);
    },
    login: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      // Store the token as a plain string, not stringified
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token); // Remove JSON.stringify here
      console.log(token);
      console.log(user);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
  },
});

export const { setCredentials, login, logout } = authSlice.actions;
export default authSlice.reducer;
