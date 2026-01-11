import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "@/lib/store";

export default function PrivateRoute() {
  const { isAuthenticated, initialized } = useAppSelector(
    (state) => state.auth
  );

  // Wait until auth is initialized (session check) to avoid false redirects
  if (!initialized) return null;

  if (!isAuthenticated) {
    return <Navigate to={"/login"} />;
  }

  return <Outlet />;
}
