// app/redux/slices/authSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Patient {
  user: PatientUser;
  token: string;
  error?: string | null; // Added error field
}

type PatientUser = {
  name: string;
  email: string;
  password: string;
  error?: string | null; // Optional error field in user
};

const initialState: Patient = {
  user: {
    name: "",
    email: "",
    password: "",
  },
  token: "",
  error: null,
};

const userSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<PatientUser>) {
      state.user = action.payload;
      state.error = action.payload.error || null; // Set error if present
    },
    setToken(state, action: PayloadAction<string>) {
      state.token = action.payload;
    },
    clearAuth(state) {
      state.user = initialState.user;
      state.token = "";
      state.error = null; // Reset error
    },
    setError(state, action: PayloadAction<string | null>) { // New action for errors
      state.error = action.payload;
    },
  },
});

export const { setUser, setToken, clearAuth, setError } = userSlice.actions;
export default userSlice.reducer;