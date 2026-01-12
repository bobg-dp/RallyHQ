import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "@/lib/store";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function PrivateRoute() {
  const { isAuthenticated, user, initialized } = useAppSelector(
    (state) => state.auth
  );

  // Wait until auth is initialized (session check) to avoid false redirects
  if (!initialized) return null;

  if (!isAuthenticated) {
    return <Navigate to={"/login"} />;
  }

  if (!user?.emailConfirmed) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="w-full max-w-md p-8">
          <Alert variant="destructive">
            <AlertDescription>
              <h2 className="font-semibold mb-2">Verify Your Email</h2>
              <p className="text-sm">
                Please verify your email address to access this area. Check your
                inbox for a verification link.
              </p>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
