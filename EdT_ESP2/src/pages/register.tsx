import { Navigate } from "react-router-dom";

// Self-registration removed — redirect to login
export default function RegisterPage() {
  return <Navigate to="/login" replace />;
}
