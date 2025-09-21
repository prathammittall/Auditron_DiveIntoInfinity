import React, { useState, useEffect, useRef } from "react";
import {
  FaGavel,
  FaBars,
  FaTimes,
  FaUser,
  FaTachometerAlt,
  FaSignOutAlt,
  FaUserEdit,
} from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [navbarWidth, setNavbarWidth] = useState(100);
  const [navbarTransform, setNavbarTransform] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const profileDropdownRef = useRef(null);
  const { currentUser, logout } = useAuth();

  // Handle scroll effect with more granular control
  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);

      // Calculate dynamic navbar width based on scroll
      const maxScroll = 300;
      const minWidth = 85; // Slightly wider for better visibility
      const scrollPercentage = Math.min(window.scrollY / maxScroll, 1);
      const newWidth = 100 - (100 - minWidth) * scrollPercentage;
      setNavbarWidth(newWidth);

      // Calculate transform for the pill shape effect
      const maxTransform = 15; // Maximum transform value
      const newTransform = maxTransform * scrollPercentage;
      setNavbarTransform(newTransform);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(e.target)
      ) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setShowProfileDropdown(false);
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Calculate opacity and other properties based on scroll position
  const scrolled = scrollPosition > 20;
  const gradientOpacity = Math.min(scrollPosition / 300, 0.85); // Increased opacity slightly

  // Calculate pill border radius based on scroll position
  const borderRadiusValue = scrolled ? "32px" : "0px";

  // Navigation items
  const navItems = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about", section: "about" },
    { name: "Services", href: "/services", section: "services" },
    { name: "FAQ", href: "/faq", section: "faq" },
    { name: "Contact", href: "/contact", section: "contact" },
  ];

  // Special nav items for quick access (Dashboard always visible now)
  const specialNavItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: <FaTachometerAlt className="mr-2" />,
    },
  ];

  // Determine if we're on a page that should show the full navbar
  const isHomePage = location.pathname === "/";
  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/signup";

  // Handle navigation link clicks with smooth scrolling
  const handleNavClick = (href, section) => {
    if (location.pathname === "/" && section) {
      // On homepage, scroll to the section
      const element = document.getElementById(section);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    } else if (section) {
      // If not on homepage but clicking a section link, navigate to homepage then scroll
      // We'll use the section as a query param which we'll handle on the homepage
      window.location.href = `/?section=${section}`;
    } else {
      // Regular navigation
      // Let React Router handle regular navigation
    }
    setMobileMenuOpen(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 flex justify-center transition-all duration-300 ${
        !isHomePage ? "bg-[#251c1a] shadow-lg" : ""
      }`}
    >
      <div
        className={`transition-all duration-500 ${
          scrolled || !isHomePage ? "py-2" : "py-5"
        }`}
        style={{
          width: isHomePage ? `${navbarWidth}%` : "100%",
          borderRadius: isHomePage ? borderRadiusValue : "0",
          background:
            scrolled || !isHomePage
              ? `linear-gradient(to right, rgba(37, 28, 26, ${gradientOpacity}), rgba(58, 45, 42, ${gradientOpacity}))`
              : "transparent",
          backdropFilter: scrolled || !isHomePage ? "blur(20px)" : "none",
          boxShadow:
            scrolled || !isHomePage ? "0 8px 32px rgba(0, 0, 0, 0.15)" : "none",
          transform:
            isHomePage && scrolled
              ? `translateY(${navbarTransform}px)`
              : "translateY(0)",
          border:
            scrolled || !isHomePage
              ? "1px solid rgba(243, 238, 229, 0.1)"
              : "none",
        }}
      >
        <div className="container mx-auto px-4 md:px-8">
          <nav className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <Link
                to="/"
                className={`text-2xl font-bold transition-all duration-300 flex items-center ${
                  scrolled || !isHomePage ? "text-[#f3eee5]" : "text-[#251c1a]"
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  // If already on homepage, just scroll to top smoothly
                  if (location.pathname === "/") {
                    window.scrollTo({
                      top: 0,
                      behavior: "smooth",
                    });
                  } else {
                    // Otherwise navigate to homepage
                    window.location.href = "/";
                  }
                  setMobileMenuOpen(false);
                }}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-10 h-10 rounded-full transform transition-all duration-500 ${
                      scrolled || !isHomePage
                        ? "bg-[#f3eee5] rotate-12 scale-105"
                        : "bg-[#251c1a]"
                    } flex items-center justify-center`}
                  >
                    <FaGavel
                      className={`text-lg transition-all duration-500 ${
                        scrolled || !isHomePage
                          ? "text-[#251c1a] scale-110"
                          : "text-[#f3eee5]"
                      }`}
                    />
                  </div>
                  {scrolled || !isHomePage ? (
                    <span className="bg-gradient-to-r from-[#f3eee5] to-[#e2dac9] text-transparent bg-clip-text">
                      Auditron
                    </span>
                  ) : (
                    <span className="text-[#251c1a]">Auditron</span>
                  )}
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <ul className="hidden md:flex items-center space-x-1 lg:space-x-3 text-sm lg:text-base font-medium transition-colors duration-300">
              {/* Regular nav items */}
              {navItems.map((item, index) => (
                <li key={`nav-${index}`} className="relative group">
                  <Link
                    to={item.href}
                    onClick={(e) => {
                      e.preventDefault();
                      if (item.name === "Home") {
                        // If Home is clicked, go to top of homepage
                        if (location.pathname === "/") {
                          window.scrollTo({
                            top: 0,
                            behavior: "smooth",
                          });
                        } else {
                          window.location.href = "/";
                        }
                      } else {
                        handleNavClick(item.href, item.section);
                      }
                    }}
                    className={`py-2 px-2 lg:px-3 rounded-md transition-all duration-300 flex items-center ${
                      scrolled || !isHomePage
                        ? "text-[#f3eee5] hover:text-white hover:bg-[#f3eee5]/10"
                        : "text-[#251c1a] hover:text-[#251c1a]/80 hover:bg-[#251c1a]/10"
                    }`}
                  >
                    {item.icon && item.icon}
                    <span>{item.name}</span>
                  </Link>
                  <div
                    className={`absolute bottom-0 left-1/2 w-1/2 h-0.5 -translate-x-1/2 ${
                      scrolled || !isHomePage ? "bg-[#f3eee5]" : "bg-[#251c1a]"
                    } scale-x-0 group-hover:scale-x-100 transition-transform origin-center duration-300`}
                  ></div>
                </li>
              ))}

              {/* Divider */}
              <div
                className={`h-6 w-px ${
                  scrolled || !isHomePage
                    ? "bg-[#f3eee5]/20"
                    : "bg-[#251c1a]/20"
                }`}
              ></div>

              {/* Special nav items */}
              {specialNavItems.map((item, index) => (
                <li key={`special-${index}`} className="relative">
                  <Link
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`py-2 px-3 rounded-md transition-all duration-300 flex items-center ${
                      scrolled || !isHomePage
                        ? "text-[#f3eee5] hover:text-white hover:bg-[#f3eee5]/10"
                        : "text-[#251c1a] hover:text-[#251c1a]/80 hover:bg-[#251c1a]/10"
                    } ${
                      location.pathname === item.href ? "bg-[#f3eee5]/10" : ""
                    }`}
                  >
                    {item.icon && item.icon}
                    <span>{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>

            {/* Auth Navigation */}
            <div className="hidden md:flex items-center">
              {currentUser ? (
                <div className="relative" ref={profileDropdownRef}>
                  <button
                    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                    className={`flex items-center space-x-2 py-1.5 px-2 rounded-full transition-all duration-300 ${
                      scrolled || !isHomePage
                        ? "text-[#f3eee5] hover:bg-[#f3eee5]/10"
                        : "text-[#251c1a] hover:bg-[#251c1a]/10"
                    }`}
                  >
                    <div className="h-8 w-8 rounded-full bg-[#f3eee5]/20 flex items-center justify-center overflow-hidden">
                      {currentUser.photoURL ? (
                        <img
                          src={currentUser.photoURL}
                          alt="Profile"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span
                          className={`text-sm font-medium ${
                            scrolled || !isHomePage
                              ? "text-[#f3eee5]"
                              : "text-[#251c1a]"
                          }`}
                        >
                          {currentUser.displayName?.charAt(0) || (
                            <FaUser className="text-sm" />
                          )}
                        </span>
                      )}
                    </div>
                    <span className="hidden lg:block text-sm font-medium">
                      {currentUser.displayName || "Profile"}
                    </span>
                  </button>

                  {showProfileDropdown && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl py-2 z-50 animate-fadeIn">
                      <div className="px-4 py-4 border-b border-gray-100">
                        <div className="flex items-center">
                          <div className="h-12 w-12 rounded-full bg-[#c8a27c]/20 flex items-center justify-center overflow-hidden mr-3">
                            {currentUser.photoURL ? (
                              <img
                                src={currentUser.photoURL}
                                alt="Profile"
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <span className="text-lg font-medium text-[#c8a27c]">
                                {currentUser.displayName?.charAt(0) || (
                                  <FaUser />
                                )}
                              </span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-[#251c1a] text-base">
                              {currentUser.displayName || "User"}
                            </p>
                            <p className="text-xs text-[#251c1a]/60 truncate mt-0.5">
                              {currentUser.email}
                            </p>
                          </div>
                        </div>
                      </div>

                      <Link
                        to="/profile"
                        onClick={() => setShowProfileDropdown(false)}
                        className="flex items-center px-4 py-3 hover:bg-[#f9f6f1] transition-colors group"
                      >
                        <div className="w-9 h-9 rounded-full bg-[#c8a27c]/10 flex items-center justify-center mr-3 group-hover:bg-[#c8a27c]/20 transition-colors">
                          <FaUserEdit className="text-[#c8a27c]" />
                        </div>
                        <span className="text-sm text-[#251c1a] font-medium">
                          Profile Settings
                        </span>
                      </Link>

                      <Link
                        to="/dashboard"
                        onClick={() => setShowProfileDropdown(false)}
                        className="flex items-center px-4 py-3 hover:bg-[#f9f6f1] transition-colors group"
                      >
                        <div className="w-9 h-9 rounded-full bg-[#c8a27c]/10 flex items-center justify-center mr-3 group-hover:bg-[#c8a27c]/20 transition-colors">
                          <FaTachometerAlt className="text-[#c8a27c]" />
                        </div>
                        <span className="text-sm text-[#251c1a] font-medium">
                          Dashboard
                        </span>
                      </Link>

                      <div className="border-t border-gray-100 my-1"></div>

                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full text-left px-4 py-3 hover:bg-[#f9f6f1] transition-colors group"
                      >
                        <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center mr-3 group-hover:bg-red-100 transition-colors">
                          <FaSignOutAlt className="text-red-500" />
                        </div>
                        <span className="text-sm text-red-600 font-medium">
                          Sign Out
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link
                    to="/login"
                    className={`py-1.5 px-3 rounded-md transition-all duration-300 ${
                      scrolled || !isHomePage
                        ? "text-[#f3eee5] hover:bg-[#f3eee5]/10"
                        : "text-[#251c1a] hover:bg-[#251c1a]/10"
                    }`}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    className={`py-1.5 px-3 rounded-md transition-all duration-300 ${
                      scrolled || !isHomePage
                        ? "bg-[#f3eee5] text-[#251c1a]"
                        : "bg-[#251c1a] text-[#f3eee5]"
                    } hover:opacity-90`}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <div className="md:hidden flex items-center">
              {currentUser && (
                <Link to="/profile" className="mr-2" aria-label="Profile">
                  <div className="h-8 w-8 rounded-full bg-[#f3eee5]/20 flex items-center justify-center overflow-hidden">
                    {currentUser.photoURL ? (
                      <img
                        src={currentUser.photoURL}
                        alt="Profile"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span
                        className={`text-sm font-medium ${
                          scrolled || !isHomePage
                            ? "text-[#f3eee5]"
                            : "text-[#251c1a]"
                        }`}
                      >
                        {currentUser.displayName?.charAt(0) || (
                          <FaUser className="text-sm" />
                        )}
                      </span>
                    )}
                  </div>
                </Link>
              )}

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`p-2.5 rounded-full transition-all duration-300 ${
                  scrolled || !isHomePage
                    ? "text-[#f3eee5] hover:bg-[#f3eee5]/20"
                    : "text-[#251c1a] hover:bg-[#251c1a]/10"
                }`}
                aria-label="Toggle mobile menu"
              >
                {mobileMenuOpen ? (
                  <FaTimes className="text-xl" />
                ) : (
                  <FaBars className="text-xl" />
                )}
              </button>
            </div>
          </nav>
        </div>
      </div>

      {/* Mobile Menu - Returning to previous design with improved spacing */}
      <div
        className={`md:hidden fixed left-0 right-0 transition-all duration-500 overflow-hidden ${
          mobileMenuOpen ? "max-h-screen" : "max-h-0"
        }`}
        style={{
          top:
            !isHomePage || isAuthPage
              ? "70px" // Increased space between navbar and content for mobile
              : scrolled
              ? `${75 + navbarTransform}px`
              : "95px",
          width: isHomePage && !isAuthPage ? `${navbarWidth}%` : "100%",
          marginLeft: "auto",
          marginRight: "auto",
          borderRadius: "0 0 28px 28px",
          background: `linear-gradient(to right, rgba(37, 28, 26, 0.97), rgba(58, 45, 42, 0.97))`,
          backdropFilter: "blur(10px)",
          boxShadow: mobileMenuOpen ? "0 8px 16px rgba(0, 0, 0, 0.15)" : "none",
          border: mobileMenuOpen
            ? "1px solid rgba(243, 238, 229, 0.1)"
            : "none",
          borderTop: "none",
          zIndex: 40,
        }}
      >
        <div className="max-h-[70vh] overflow-y-auto">
          <ul className="flex flex-col text-[#f3eee5] font-medium divide-y divide-[#f3eee5]/10">
            {/* Auth options for mobile */}
            {!currentUser ? (
              <>
                <li>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center px-6 py-3 font-medium hover:bg-[#f3eee5]/10 transition-colors"
                  >
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link
                    to="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center px-6 py-3 font-medium bg-[#f3eee5]/10 hover:bg-[#f3eee5]/20 transition-colors"
                  >
                    Sign Up
                  </Link>
                </li>
              </>
            ) : (
              <li>
                <div className="px-6 py-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-[#f3eee5]/20 flex items-center justify-center mr-3 flex-shrink-0 overflow-hidden border border-[#f3eee5]/30">
                        {currentUser.photoURL ? (
                          <img
                            src={currentUser.photoURL}
                            alt="Profile"
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-lg font-medium">
                            {currentUser.displayName?.charAt(0) || (
                              <FaUser className="text-sm" />
                            )}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">
                          {currentUser.displayName || "User"}
                        </p>
                        <p className="text-xs text-[#f3eee5]/60 truncate max-w-[150px]">
                          {currentUser.email}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="p-2 rounded-md hover:bg-[#f3eee5]/10 transition-colors"
                      aria-label="Sign Out"
                    >
                      <FaSignOutAlt className="text-[#f3eee5]/70" />
                    </button>
                  </div>
                  <div className="flex space-x-2">
                    <Link
                      to="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex flex-1 items-center justify-center py-2 px-3 bg-[#f3eee5]/10 hover:bg-[#f3eee5]/15 rounded-md transition-colors text-sm"
                    >
                      <FaUserEdit className="mr-2" />
                      Profile Settings
                    </Link>
                    <Link
                      to="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex flex-1 items-center justify-center py-2 px-3 bg-[#f3eee5]/10 hover:bg-[#f3eee5]/15 rounded-md transition-colors text-sm"
                    >
                      <FaTachometerAlt className="mr-2" />
                      Dashboard
                    </Link>
                  </div>
                </div>
              </li>
            )}

            <li className="bg-[#f3eee5]/5 px-6 py-2 text-xs text-[#f3eee5]/50 uppercase tracking-wider">
              Navigation
            </li>

            {/* Normal nav items for mobile */}
            {navItems.map((item, index) => (
              <li key={`mobile-${index}`}>
                <Link
                  to={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    if (item.name === "Home") {
                      // If Home is clicked, go to top of homepage
                      if (location.pathname === "/") {
                        window.scrollTo({
                          top: 0,
                          behavior: "smooth",
                        });
                        setMobileMenuOpen(false);
                      } else {
                        window.location.href = "/";
                      }
                    } else {
                      handleNavClick(item.href, item.section);
                    }
                  }}
                  className="flex items-center px-6 py-4 hover:bg-[#f3eee5]/10 transition-colors"
                >
                  {item.icon ? item.icon : <span className="w-6"></span>}
                  {item.name}
                </Link>
              </li>
            ))}

            {/* Divider */}
            <li className="bg-[#f3eee5]/5 px-6 py-2 text-xs text-[#f3eee5]/50 uppercase tracking-wider">
              Quick Access
            </li>

            {/* Special nav items for mobile */}
            {specialNavItems.map((item, index) => (
              <li key={`mobile-special-${index}`}>
                <Link
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center px-6 py-4 hover:bg-[#f3eee5]/10 transition-colors ${
                    location.pathname === item.href ? "bg-[#f3eee5]/10" : ""
                  }`}
                >
                  {item.icon}
                  <span>{item.name}</span>
                  {location.pathname === item.href && (
                    <span className="ml-2 bg-[#f3eee5] text-[#251c1a] text-xs px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </header>
  );
}

export default Navbar;