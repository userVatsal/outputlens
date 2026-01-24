import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { TrendingDown, ArrowRight, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center max-w-md px-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-bearish/10 text-bearish mb-6">
          <TrendingDown className="h-8 w-8" />
        </div>
        <h1 className="mb-2 text-4xl font-bold text-foreground">404</h1>
        <p className="mb-2 text-xl font-semibold text-foreground">
          This trade didn't pan out.
        </p>
        <p className="mb-8 text-muted-foreground">
          The page you're looking for doesn't exist—but your next winning analysis might.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button asChild>
            <Link to="/analyze">
              Analyze a Trade
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/">
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;