
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Gem, Home } from "lucide-react";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-diamond-50 to-white p-4">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-diamond-300 to-diamond-600 mb-6 shadow-lg">
          <Gem className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold mb-4 text-diamond-900">404</h1>
        <p className="text-xl text-diamond-600 mb-6">Page not found</p>
        <p className="text-muted-foreground mb-8">
          We couldn't find the page you were looking for.
        </p>
        <Button asChild>
          <Link to="/dashboard" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            Return to Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
