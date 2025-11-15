import { NavLink } from "@/components/NavLink";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useState } from "react";

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
          </nav>
        )}
      </div>
    </header>
  );
};
