import { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Gem, Home } from "lucide-react";
import { motion } from "framer-motion";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 bg-gradient-to-br from-diamond-50 via-white to-slate-100 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="text-center max-w-md w-full"
      >
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-diamond-400 to-diamond-600 mb-6 shadow-xl">
          <Gem className="h-10 w-10 text-white" />
        </div>

        <h1 className="text-5xl font-extrabold mb-2 text-diamond-800 dark:text-white tracking-tight">
          404
        </h1>
        <p className="text-xl font-medium text-diamond-600 dark:text-diamond-300 mb-4">
          Page not found
        </p>
        <p className="text-sm text-muted-foreground mb-8 dark:text-zinc-400">
          Sorry, we couldn’t find the page you were looking for. Double-check the URL or head back to the dashboard.
        </p>

        <Button asChild size="lg" className="transition-transform hover:scale-105">
          <Link to="/dashboard" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            Return to Dashboard
          </Link>
        </Button>
      </motion.div>

      {/* Optional SVG illustration */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 0.15, y: 0 }}
        transition={{ duration: 1.5, delay: 0.3 }}
        className="absolute bottom-10 opacity-10 dark:opacity-20"
      >
        <svg width="200" height="200" viewBox="0 0 200 200" fill="none">
          <circle cx="100" cy="100" r="80" fill="#93c5fd" />
          <text x="100" y="112" textAnchor="middle" fontSize="32" fill="#fff" fontWeight="bold">404</text>
        </svg>
      </motion.div>
    </div>
  );
};

export default NotFound;
