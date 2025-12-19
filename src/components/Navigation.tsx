import { Link, useLocation } from "react-router-dom";
import { Menu, X, BookOpen, Home, BarChart3 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DarkModeToggle } from "./DarkModeToggle";

export const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { path: "/", label: "Dashboard", icon: Home },
    { path: "/subjects", label: "Subjects", icon: BookOpen },
    { path: "/history", label: "History", icon: BarChart3 },
  ];

  return (
    <>
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 font-bold text-xl bg-gradient-primary bg-clip-text text-transparent">
        <BookOpen className="h-6 w-6 text-primary" />
        ExamPrep Pro
      </Link>

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
        {navLinks.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                isActive(link.path)
                  ? "bg-primary text-primary-foreground shadow-elegant"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <Icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
      </div>

      {/* Desktop Right Side - Theme Toggle */}
      <div className="hidden md:flex items-center gap-2">
        <DarkModeToggle />
      </div>

      {/* Mobile Menu Button */}
      <div className="md:hidden flex items-center gap-2">
        <DarkModeToggle />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-full"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden absolute left-0 right-0 top-16 bg-card border-b border-border shadow-lg">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-all ${
                      isActive(link.path)
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
