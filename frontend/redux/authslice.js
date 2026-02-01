import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../utils/axios";

// 1. Check Auth (Keep existing)
export const checkAuth = createAsyncThunk("auth/checkAuth", async (_, { rejectWithValue }) => {
    try {
        const response = await api.get("/users/me");
        return response.data.data; 
    } catch (error) {
        return rejectWithValue(null); 
    }
});

// 2. Login User (Keep existing)
export const loginUser = createAsyncThunk("auth/loginUser", async (credentials, { rejectWithValue }) => {
    try {
        const response = await api.post("/users/login", credentials);
        return response.data.data.user;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || "Login failed");
    }
});

// 3. Register User (NEW ADDITION)
export const registerUser = createAsyncThunk("auth/registerUser", async (userData, { rejectWithValue }) => {
    try {
        // Now returns tokens + user data
        const response = await api.post("/users/register", userData);
        return response.data.data.user; 
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || "Registration failed");
    }
});

// 4. Logout User (Keep existing)
export const logoutUser = createAsyncThunk("auth/logoutUser", async (_, { rejectWithValue }) => {
    try {
        await api.post("/users/logout");
    } catch (error) {
        console.error("Logout failed", error);
    }
});

const authSlice = createSlice({
    name: "auth",
    initialState: {
        user: null,
        isAuthenticated: false,
        isLoading: true,
        error: null,
    },
    reducers: {
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // --- Check Auth ---
            .addCase(checkAuth.pending, (state) => { state.isLoading = true; })
            .addCase(checkAuth.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isAuthenticated = true;
                state.user = action.payload;
            })
            .addCase(checkAuth.rejected, (state) => {
                state.isLoading = false;
                state.isAuthenticated = false;
                state.user = null;
            })

            // --- Login ---
            .addCase(loginUser.pending, (state) => { state.isLoading = true; state.error = null; })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isAuthenticated = true;
                state.user = action.payload;
                state.error = null;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })

            // --- Register (NEW HANDLERS) ---
            .addCase(registerUser.pending, (state) => { 
                state.isLoading = true; 
                state.error = null; 
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isAuthenticated = true; // Auto-login enabled
                state.user = action.payload;
                state.error = null;
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })

            // --- Logout ---
            .addCase(logoutUser.fulfilled, (state) => {
                state.user = null;
                state.isAuthenticated = false;
            });
    },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;