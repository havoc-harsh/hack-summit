import axios from "axios";
import { Dispatch } from "@reduxjs/toolkit";
import { setUser , clearAuth , setToken } from "../redux/slices/authSlice";

// Define types for user data and API responses
interface UserData {
  name?: string;
  address?: string;
  contactPerson?: string;
  phone?: string;
  email: string;
  licenseNumber?: string;
  password: string;
}

interface AuthResponse {
  user: UserData;
  token: string;
}

// Signup action
export const signupUser =
  (userData: UserData) => async (dispatch: Dispatch) => {
    try {
      const res = await axios.post<AuthResponse>("/api/auth/register", userData);
      dispatch(setUser(res.data.user));
    } catch (error) {
      console.error("Signup failed:", error);
    }
  };

// Login action
export const loginUser =
  (userData: UserData) =>
  async (dispatch: Dispatch) => {
    try {
      const res = await axios.post<AuthResponse>("/api/auth/login", userData);
      dispatch(setUser(res.data.user));
      dispatch(setToken(res.data.token));
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

// Logout action
export const logoutUser = () => async (dispatch: Dispatch) => {
  try {
    await axios.post("/api/auth/logout");
    dispatch(clearAuth());
  } catch (error) {
    console.error("Logout failed:", error);
  }
};