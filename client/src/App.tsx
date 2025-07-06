import React, { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AuthLayout from "./layouts/auth-layout";
import Signin from "./pages/auth/signin";
import Signup from "./pages/auth/signup";
import SuperadminSignin from "./pages/auth/superadmin-signin";
import { useAppDispatch, useAppSelector } from "./hooks/store-hooks";
import { Loader2 } from "lucide-react";
import { CheckingAuthFn } from "./redux/auth-slice";
import ProtectedRoute from "./components/common/protected-route";
import MainLayout from "./layouts/main-layout";
import Dashboard from "./pages/admin/dashboard";
import NewPurchase from "./pages/admin/purchase/new-purchase";

const App = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, user, isLoading, userPermissions, userRole } =
    useAppSelector((state) => state.auth);
  console.log(isAuthenticated, userRole, userPermissions);

  useEffect(() => {
    dispatch(CheckingAuthFn());
  }, [dispatch]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 text-purple-700 animate-spin" />
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Auth Routes (no ProtectedRoute here!) */}
      <Route
        path="/auth"
        element={isAuthenticated ? <Navigate to="/" replace /> : <AuthLayout />}
      >
        <Route path="signin" element={<Signin />} />
        <Route path="signup" element={<Signup />} />
      </Route>

      {/* SuperAdmin Login Page */}
      <Route path="/superadmin" element={<AuthLayout />}>
        <Route path="signin" element={<SuperadminSignin />} />
      </Route>

      {/* Protected Main Application Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="purchase">
          <Route
            path="new-purchase"
            element={
              <ProtectedRoute
                isAuthenticated={isAuthenticated}
                userRole={userRole}
                requiredPermission={[
                  { module: "purchase", actions: ["create"] },
                ]}
                user={user}
              >
                <NewPurchase />
              </ProtectedRoute>
            }
          />
        </Route>
      </Route>
    </Routes>
  );
};

export default App;
