import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  ADMIN_SIGNIN,
  ADMIN_SIGNUP,
  CHECK_AUTH,
  SUPERADMIN_SIGNIN,
  SUPERADMIN_SIGNUP,
} from "../../lib/apis";
import api from "../../utils/axios";

// Types
interface RolePermission {
  module: string;
  actions: string[];
}

interface UserRole {
  name: string;
  permissions: RolePermission[];
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: string | UserRole; // could be "ADMIN" or an object
}

interface SIGNUP_FORMDATA {
  name: string;
  email: string;
  password: string;
}

interface AUTH_STATE {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  userRole: string | null;
  userPermissions: RolePermission[];
}

const initialState: AUTH_STATE = {
  isAuthenticated: false,
  isLoading: false,
  user: null,
  userRole: null,
  userPermissions: [],
};

// Thunks
export const SuperAdminSignupFn = createAsyncThunk(
  "superadmin/signup",
  async (formData: SIGNUP_FORMDATA, { rejectWithValue }) => {
    try {
      const response = await api.post(SUPERADMIN_SIGNUP, formData);
      return response.data;
    } catch (error) {
      return rejectWithValue({
        success: false,
        message: "Internal Server Error",
      });
    }
  }
);

export const SuperAdminSigninFn = createAsyncThunk(
  "superadmin/signin",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.post(SUPERADMIN_SIGNIN, formData);
      return response.data;
    } catch (error) {
      return rejectWithValue({
        success: false,
        message: "Internal Server Error",
      });
    }
  }
);

export const AdminSignupFn = createAsyncThunk(
  "admin/signup",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.post(ADMIN_SIGNUP, formData);
      return response.data;
    } catch (error) {
      return rejectWithValue({
        success: false,
        message: "Internal Server Error",
      });
    }
  }
);

export const AdminSigninFn = createAsyncThunk(
  "admin/signin",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.post(`${ADMIN_SIGNIN}`, formData);
      return response.data;
    } catch (error) {
      return rejectWithValue({
        success: false,
        message: "Internal Server Error",
      });
    }
  }
);

export const CheckingAuthFn = createAsyncThunk(
  "auth/check-auth",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(CHECK_AUTH, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue({
        success: false,
        message: "Internal Server Error",
      });
    }
  }
);

// Slice
export const AuthSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.isAuthenticated = false;
      state.isLoading = false;
      state.user = null;
      state.userRole = null;
      state.userPermissions = [];
    },
  },
  extraReducers(builder) {
    // SuperAdmin Signup
    builder.addCase(SuperAdminSignupFn.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(SuperAdminSignupFn.fulfilled, (state) => {
      state.isLoading = false;
      state.isAuthenticated = false;
    });
    builder.addCase(SuperAdminSignupFn.rejected, (state) => {
      state.isLoading = false;
    });

    // SuperAdmin Signin
    builder.addCase(SuperAdminSigninFn.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(SuperAdminSigninFn.fulfilled, (state, action) => {
      state.isLoading = false;
      const payload = action.payload;
      console.log("action",payload.data);
      
      state.isAuthenticated = payload.success ? true : false ;
      state.user = payload.success ? payload.data : null;
      if (payload.success) {
        const role = payload.data?.role;
        state.userRole = typeof role === "string" ? role : role?.name ?? null;
        state.userPermissions =
          typeof role === "object" ? role.permissions ?? [] : [];
      }
    });
    builder.addCase(SuperAdminSigninFn.rejected, (state) => {
      state.isLoading = false;
    });

    // Admin Signup
    builder.addCase(AdminSignupFn.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(AdminSignupFn.fulfilled, (state) => {
      state.isLoading = false;
    });
    builder.addCase(AdminSignupFn.rejected, (state) => {
      state.isLoading = false;
    });

    // Admin Signin
    builder.addCase(AdminSigninFn.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(AdminSigninFn.fulfilled, (state, action) => {
      state.isLoading = false;
      const payload = action.payload;
      state.user = payload.success ? payload.data : null;
      state.isAuthenticated = payload.success ? true : false;
      if (payload.success) {
        const role = payload.data?.role;
        state.userRole = typeof role === "string" ? role : role?.name ?? null;
        state.userPermissions =
          typeof role === "object" ? role.permissions ?? [] : [];
      }
    });
    builder.addCase(AdminSigninFn.rejected, (state) => {
      state.isLoading = false;
    });

    // Check Auth
    builder.addCase(CheckingAuthFn.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(CheckingAuthFn.fulfilled, (state, action) => {
      state.isLoading = false;
      const payload = action.payload;
      console.log("action",payload.data);
      state.user = payload.success ? payload.data : null;
      state.isAuthenticated = payload.success;
      if (payload.success) {
        const role = payload.data?.role;
        
        state.userRole = typeof role === "string" ? role : role?.name ?? null;
        state.userPermissions =
          typeof role === "object" ? role.permissions ?? [] : [];
      }
    });
    builder.addCase(CheckingAuthFn.rejected, (state) => {
      state.isLoading = false;
    });
  },
});

export const { logout } = AuthSlice.actions;
export default AuthSlice.reducer;
