import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import NotFoundPage from "../components/notfound/NotFoundPage";

import ProtectedLayout from "../layouts/ProtectedLayout";
import PublicRoute from "./PublicRoute";
import { routesConfig } from "../constants/Routeconfig";
import DashboardLayout from "../layouts/DashboardLayout";
import ResetPassword from "../features/common/auth/forgot-password/Reset-password";
import ForgotPassword from "../features/common/auth/forgot-password/Forgot-password";
import SeminarRegistration from "../features/admin/razorpay/SeminarRegistration";

// Utility function to render nested routes
export const renderRoutes = (routes: any[]) =>
  routes.map(({ path, element, children }) =>
    children ? (
      <Route key={path} path={path} element={element}>
        {renderRoutes(children)}
      </Route>
    ) : (
      <Route key={path} path={path} element={element} />
    )
  );

const AppRoutes = () => {
  return (
    <Routes>

      {/* Root Redirect */}
      <Route path="/" element={<Navigate to="/login" />} />

      {/* LOGIN */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />

      {/* FORGOT PASSWORD — NO SIDEBAR */}
      <Route
        path="/forgot-password"
        element={
          <PublicRoute>
            <ForgotPassword />
          </PublicRoute>
        }
      />

      {/* SEMINAR REGISTRATION — NO SIDEBAR */}
      <Route
        path="/seminar-registration"
        element={
          <PublicRoute>
            <SeminarRegistration />
          </PublicRoute>
        }
      />

      {/* RESET PASSWORD — NO SIDEBAR */}
      <Route
        path="/reset-password"
        element={
          <PublicRoute>
            <ResetPassword />
          </PublicRoute>
        }
      />

      {/* PROTECTED ROUTES — WITH SIDEBAR */}
      <Route element={<ProtectedLayout />}>
        <Route element={<DashboardLayout />}>
          {renderRoutes(routesConfig)}
        </Route>
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />

    </Routes>
  );
};

export default AppRoutes;