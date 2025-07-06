import { Navigate, useLocation } from "react-router-dom";

interface RequiredPermission {
  module: string;
  actions: string[];
}

interface ProtectedRouteProps {
  isAuthenticated: boolean;
  userRole?: string;
  allowedRoles?: string[];
  requiredPermission?: RequiredPermission[];
  user?: {
    role:
      | string
      | {
          name: string;
          permissions: { module: string; actions: string[] }[];
        };
  };
  children: React.ReactNode;
}

const ProtectedRoute = ({
  isAuthenticated,
  userRole,
  allowedRoles,
  requiredPermission,
  user,
  children,
}: ProtectedRouteProps) => {
  const location = useLocation();

  console.log("🔐 ProtectedRoute check:", {
    isAuthenticated,
    userRole,
    requiredPermission,
  });

  // 🚫 1. Block authenticated users from accessing /auth/* routes
  if (isAuthenticated && location.pathname.startsWith("/auth")) {
    return <Navigate to="/" replace />;
  }

  // 🔐 2. Redirect unauthenticated users
  if (!isAuthenticated) {
    return <Navigate to="/auth/signin" replace />;
  }

  // ✅ 3. Allow Superadmin or Admin access to everything
  if (userRole === "SUPERADMIN" || userRole === "ADMIN") {
    console.log("🟢 Access granted to SUPERADMIN/ADMIN");
    return <>{children}</>;
  }

  // 🚫 4. Block if user's role isn't in allowedRoles
  if (allowedRoles && !allowedRoles.includes(userRole ?? "")) {
    return <Navigate to="/unauthorized" replace />;
  }

  // 🔍 5. Check for custom role permissions
  if (requiredPermission && requiredPermission.length > 0) {
    const rolePermissions =
      typeof user?.role === "object" && Array.isArray(user.role.permissions)
        ? user.role.permissions
        : [];

    const hasAccess = requiredPermission.some((req) =>
      rolePermissions.some(
        (perm) =>
          perm.module === req.module &&
          req.actions.every((action) => perm.actions.includes(action))
      )
    );

    if (!hasAccess) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // ✅ 6. All checks passed
  return <>{children}</>;
};

export default ProtectedRoute;
