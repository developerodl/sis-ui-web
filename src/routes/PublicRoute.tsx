import React, { type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { getValue } from "../utils/localStorageUtil";

interface PublicRouteProps {
  children: ReactNode;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const token = getValue("ACCESS_TOKEN_KEY");
  const role = String(getValue("role_name") || "").trim().toLowerCase();
  const student_id = Number(getValue("student_id"));

  // If the user is logged in, redirect based on their role
  if (token) {
    if (role === "admin") {
       return <Navigate to="/students/list" />;
    }

    if (role === "student" && student_id) {
       return <Navigate to="/students/detail" />;
    }

    if (role === "faculty" || role === "faculty1") {
       return <Navigate to="/facultylogin/grievance/list" />;
    }
    // return <Navigate to="/unauthorized" />;
  }

  // If no token, render children (public routes like login)
  return <>{children}</>;
};

export default PublicRoute;
