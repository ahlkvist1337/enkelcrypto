import { NavLink } from "@/components/NavLink";
import { Button } from "@/components/ui/button";
import { Menu, Settings, LogOut, User } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <NavLink to="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">₿</span>
            </div>
            <span className="text-xl font-bold text-foreground">CryptoWatch</span>
          </NavLink>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <NavLink
              to="/"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              activeClassName="text-primary"
            >
              Hem
            </NavLink>
            <NavLink
              to="/arkiv"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              activeClassName="text-primary"
            >
              Arkiv
            </NavLink>
            <NavLink
              to="/veckorapporter"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              activeClassName="text-primary"
            >
              Veckorapporter
            </NavLink>
            <NavLink
              to="/om"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              activeClassName="text-primary"
            >
              Om
            </NavLink>
            {isAdmin && (
              <NavLink
                to="/admin"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary flex items-center gap-1"
                activeClassName="text-primary"
              >
                <Settings className="h-4 w-4" />
                Admin
              </NavLink>
            )}
            {user ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logga ut
              </Button>
            ) : (
              <Button
                variant="default"
                size="sm"
                onClick={() => navigate("/auth")}
                className="flex items-center gap-2"
              >
                <User className="h-4 w-4" />
                Logga in
              </Button>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden pb-4 space-y-2">
            <NavLink
              to="/"
              className="block py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              activeClassName="text-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              Hem
            </NavLink>
            <NavLink
              to="/arkiv"
              className="block py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              activeClassName="text-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              Arkiv
            </NavLink>
            <NavLink
              to="/veckorapporter"
              className="block py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              activeClassName="text-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              Veckorapporter
            </NavLink>
            <NavLink
              to="/om"
              className="block py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              activeClassName="text-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              Om
            </NavLink>
            {isAdmin && (
              <NavLink
                to="/admin"
                className="block py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary flex items-center gap-1"
                activeClassName="text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Settings className="h-4 w-4" />
                Admin
              </NavLink>
            )}
            {user ? (
              <button
                onClick={() => {
                  handleSignOut();
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary flex items-center gap-1"
              >
                <LogOut className="h-4 w-4" />
                Logga ut
              </button>
            ) : (
              <button
                onClick={() => {
                  navigate("/auth");
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary flex items-center gap-1"
              >
                <User className="h-4 w-4" />
                Logga in
              </button>
            )}
          </nav>
        )}
      </div>
    </header>
  );
};
