import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route, useLocation } from "wouter";
import { useEffect } from "react";

export function ProtectedRoute({
  path,
  component: Component,
  allowedRoles = []
}: {
  path: string;
  component: () => JSX.Element;
  allowedRoles?: string[];
}) {
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();

  // Effect to handle role-based redirection when component mounts
  useEffect(() => {
    if (user && path === "/") {
      // Direct users to their main page based on role
      switch(user.role) {
        case 'sales':
          navigate("/products");
          break;
        case 'finance':
          navigate("/income");
          break;
        case 'developer':
          navigate("/files");
          break;
        case 'investor':
          navigate("/income");
          break;
        case 'iwc_partner':
          navigate("/dashboard");
          break;
        default:
          // Keep them on dashboard if no specific route
          break;
      }
    }
  }, [user, path, navigate]);

  return (
    <Route path={path}>
      {isLoading ? (
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-border" />
        </div>
      ) : user ? (
        <Component />
      ) : (
        <Redirect to="/auth" />
      )}
    </Route>
  );
}
