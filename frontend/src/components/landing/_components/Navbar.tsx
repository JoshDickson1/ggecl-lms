import { useState } from "react";
import { Link } from "react-router";
import { FaBars, FaTimes } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import SearchBar from "@/components/ui/SearchBar";
import { Moon, ShoppingCart, Sun } from "lucide-react";
import lightImg from "@/assets/images/LOGO.png";
import darkImg from "@/assets/images/LOGO-dark.png";
import { useTheme } from "@/hooks/useTheme";
import { links } from "@/components/constants/Navlinks";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const Navbar = ({ showNav }: { showNav?: boolean }) => {
  const { darkMode, setDarkMode } = useTheme();
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const { userId } = useAuth();

  const logoSrc = darkMode ? lightImg : darkImg;

  return (
    <nav className="sticky top-0 left-0 z-50 w-full bg-white py-3 shadow-sm transition-all duration-300 ease-in-out dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-5">
          {/* Logo */}
          <Link
            to="/"
            className="text-xl font-bold text-gray-900 dark:text-white"
          >
            <img src={logoSrc} alt="Logo" width={55} />
          </Link>

          {!showNav ? (
            <SearchBar />
          ) : (
            <div className="hidden space-x-6 md:flex">
              {links.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="font-bold text-gray-700 transition-colors duration-150 hover:text-blue-500 dark:text-gray-300"
                >
                  {link.title}
                </Link>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <Link to="/login">
              <Button className="hidden h-fit rounded-md border border-[#123354] bg-transparent font-bold text-gray-700 transition duration-300 hover:bg-[#123354] hover:text-white md:block dark:text-gray-300">
                Login Student
              </Button>
            </Link>
            <Link to="/instructor/login">
              <Button className="btn hidden rounded-md font-bold text-white md:block">
                Login Instructor
              </Button>
            </Link>

            <Link
              to={"/cart"}
              className={cn(
                "hidden size-9 items-center justify-center rounded-full bg-blue-300/30 transition-all hover:bg-blue-300/80 md:flex",
                { "md:hidden": !userId },
              )}
            >
              <ShoppingCart size={18} />
            </Link>
            {/* Dark mode toggle */}
            <Button
              size={"icon"}
              onClick={() => setDarkMode((prev) => !prev)}
              aria-label="Toggle Dark Mode"
              className="rounded-full ring"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </Button>
            {/* Mobile menu toggle */}
            <button
              onClick={() => setMenuOpen((prev) => !prev)}
              className="p-2 text-gray-800 md:hidden dark:text-white"
              aria-label="Toggle Menu"
            >
              {menuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {menuOpen && (
        <div className="flex flex-col gap-4 bg-white p-5 py-4 md:hidden dark:bg-gray-900">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="font-bold text-gray-700 hover:text-blue-500 dark:text-gray-400"
              onClick={() => setMenuOpen(false)}
            >
              {link.title}
            </Link>
          ))}
          <Link
            onClick={() => setMenuOpen(false)}
            to={"/cart"}
            className={cn(
              "font-bold text-gray-700 hover:text-blue-500 dark:text-gray-300",
              { "md:hidden": !userId },
            )}
          >
            Cart
          </Link>
          <div className="mx-auto flex flex-col items-center gap-y-4">
            <Link to="/login">
              <Button className="h-fit rounded-md border border-[#123354] bg-transparent font-bold text-gray-700 transition duration-300 hover:bg-[#123354] hover:text-white dark:text-gray-300">
                Login Student
              </Button>
            </Link>
            <Link to="/instructor/login">
              <Button className="btn rounded-md font-bold text-white md:block">
                Login Instructor
              </Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
