import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Music, Heart, LayoutDashboard, Settings } from "lucide-react";
import { UserProfileDropdown } from "./UserProfileDropdown";

export function Navbar() {
  const { user } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-navbar backdrop-blur-md">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2 font-bold tracking-tight">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
              <Music className="h-4 w-4 text-white" />
            </div>
            <span className="text-navbar-foreground">Concert<span className="text-primary">Tracker</span></span>
          </Link>

          {user && (
            <div className="flex items-center gap-1">
              <Link
                to="/"
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors ${
                  isActive("/")
                    ? "text-primary"
                    : "text-navbar-foreground/60 hover:text-navbar-foreground"
                }`}
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
              <Link
                to="/wishlist"
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors ${
                  isActive("/wishlist")
                    ? "text-primary"
                    : "text-navbar-foreground/60 hover:text-navbar-foreground"
                }`}
              >
                <Heart className="h-4 w-4" />
                Wishlist
              </Link>
              <Link
                to="/admin"
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors ${
                  isActive("/admin")
                    ? "text-primary"
                    : "text-navbar-foreground/60 hover:text-navbar-foreground"
                }`}
              >
                <Settings className="h-4 w-4" />
                Admin
              </Link>
            </div>
          )}
        </div>

        {user && <UserProfileDropdown />}
      </div>
    </nav>
  );
}
