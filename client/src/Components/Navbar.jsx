import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Search, Settings, LogOut, ChevronDown } from "lucide-react";
import { useAuth } from "../Contexts/authContext";

const Navbar = ({ showSearchBar }) => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showAdminMenu, setShowAdminMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");

  useEffect(() => {
    const queryParam = searchParams.get("q");
    if (queryParam) {
      setSearchQuery(queryParam);
    }
  }, [searchParams]);

  const handleLogout = () => {
    logout();
    setShowAdminMenu(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const currentFilters = {};
      ["sortBy", "timeRange", "quality", "platform"].forEach((param) => {
        const value = searchParams.get(param);
        if (value) currentFilters[param] = value;
      });

      const params = new URLSearchParams({
        q: searchQuery.trim(),
        ...currentFilters,
      });

      navigate(`/search?${params}`);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch(e);
    }
  };

  return (
    <nav className="sticky top-0 z-50">
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-transparent -z-20" />

      <div
        className="absolute inset-0 backdrop-blur-sm -z-10"
        style={{
          maskImage: "linear-gradient(to bottom, black, transparent)",
          WebkitMaskImage: "linear-gradient(to bottom, black, transparent)",
        }}
      />

      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center space-x-4 w-48">
            <Link
              to="/"
              className="text-2xl font-bold text-white hover:text-gray-200 transition-colors"
            >
              Logo
            </Link>
          </div>

          {/* Centered Search Bar */}
          {showSearchBar && (
            <div className="flex-1 max-w-2xl px-4">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Search..."
                  className="w-full h-10 bg-gray-700/80 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  aria-label="Ara"
                >
                  <Search className="w-5 h-5" />
                </button>
              </form>
            </div>
          )}

          {/* Right Section */}
          <div className="flex items-center justify-end space-x-6 w-48">
            {/* Admin Menu */}
            {isAdmin && (
              <div className="relative">
                <button
                  onClick={() => setShowAdminMenu(!showAdminMenu)}
                  className="flex items-center gap-2 text-gray-300 hover:text-white py-2 px-3 rounded-lg hover:bg-gray-700/50 transition-all"
                  title="Admin Menü"
                >
                  <Settings className="w-5 h-5" />
                  <span className="font-medium">Admin</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                {showAdminMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-xl py-1 border border-gray-700">
                    <Link
                      to="/admin"
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700/50 hover:text-white transition-all"
                      onClick={() => setShowAdminMenu(false)}
                    >
                      <Settings className="w-4 h-4" />
                      Control Panel
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700/50 hover:text-white transition-all w-full"
                    >
                      <LogOut className="w-4 h-4" />
                      Log out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Hidden Admin Login Link */}
          {!user && <Link to="/login" className="hidden" aria-hidden="true" />}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
