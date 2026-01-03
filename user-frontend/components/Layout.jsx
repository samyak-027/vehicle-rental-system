import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useStore } from "../context/store.jsx";
import { Menu, X, Car, LogOut } from "lucide-react";
import * as api from "../services/api.js";

export const Layout = ({ children }) => {
  const { state, dispatch } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (err) {
      console.error("Logout error:", err);
    }

    // Clear all auth data
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    dispatch({ type: "LOGOUT" });
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* NAVBAR */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <Car className="h-8 w-8 text-primary" />
            <span className="font-bold text-xl text-slate-800">RideSurf</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              to="/"
              className={`px-3 py-2 text-sm ${
                location.pathname === "/"
                  ? "text-primary"
                  : "text-slate-600 hover:text-primary"
              }`}
            >
              Home
            </Link>

            <Link
              to="/vehicles"
              className="text-slate-600 hover:text-primary px-3 py-2 text-sm"
            >
              Vehicles
            </Link>

            {state.auth.isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  className="text-slate-600 hover:text-primary px-3 py-2"
                >
                  Profile
                </Link>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-full text-sm"
                >
                  <LogOut size={16} /> Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-slate-600 hover:text-primary px-3 py-2"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-primary text-white px-4 py-2 rounded-full"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden"
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="p-3 space-y-2">
              <Link to="/" className="block">Home</Link>
              <Link to="/vehicles">Vehicles</Link>

              {state.auth.isAuthenticated ? (
                <>
                  <Link to="/profile">Profile</Link>
                  <button
                    onClick={handleLogout}
                    className="text-red-600 w-full text-left"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login">Login</Link>
                  <Link to="/signup">Signup</Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* CONTENT */}
      <main className="flex-grow">{children}</main>

      {/* FOOTER */}
      <footer className="bg-secondary text-slate-400 py-6 text-center">
        <p>© 2025 RideSurf. All rights reserved.</p>
      </footer>
    </div>
  );
};
