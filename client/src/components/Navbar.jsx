import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiMenu, FiX, FiGlobe, FiZap, FiUser, FiLogOut, FiShield, FiMap, FiChevronDown } from "react-icons/fi";
import { useApp } from "../utils/AppContext";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "ar", label: "العربية" },
  { code: "zh", label: "中文" },
];

export default function Navbar() {
  const { lowBandwidth, setLowBandwidth, language, setLanguage, currentUser, logout } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    setMenuOpen(false);
    navigate("/");
  };

  // Nav links depend on role
  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/search", label: "Find Resources" },
    ...(currentUser?.role === "admin" ? [{ to: "/admin", label: "Dashboard" }] : []),
    ...(currentUser ? [{ to: "/map", label: "Map", icon: FiMap }] : []),
  ];

  return (
    <nav className="sticky top-0 z-50 glass border-b border-white/20 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white text-sm font-bold">CR</span>
            </div>
            <span className="font-bold text-slate-800 text-lg hidden sm:block">
              Community<span className="gradient-text">Finder</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  pathname === link.to
                    ? "bg-blue-50 text-blue-600"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {link.icon && <link.icon size={14} />}
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Controls */}
          <div className="hidden md:flex items-center gap-2">
            {/* Low Bandwidth Toggle */}
            <button
              onClick={() => setLowBandwidth(!lowBandwidth)}
              title="Toggle low-bandwidth mode"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                lowBandwidth
                  ? "bg-amber-100 text-amber-700 border border-amber-200"
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}
            >
              <FiZap size={13} />
              {lowBandwidth ? "Low-BW ON" : "Low-BW"}
            </button>

            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => { setLangOpen(!langOpen); setUserMenuOpen(false); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all"
              >
                <FiGlobe size={13} />
                {LANGUAGES.find((l) => l.code === language)?.label}
              </button>
              <AnimatePresence>
                {langOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="absolute right-0 mt-2 w-36 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50"
                  >
                    {LANGUAGES.map((l) => (
                      <button
                        key={l.code}
                        onClick={() => { setLanguage(l.code); setLangOpen(false); }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                          language === l.code ? "bg-blue-50 text-blue-600 font-medium" : "text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        {l.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Auth Section */}
            {currentUser ? (
              /* Logged-in user menu */
              <div className="relative">
                <button
                  onClick={() => { setUserMenuOpen(!userMenuOpen); setLangOpen(false); }}
                  className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-xl bg-white border border-slate-200 hover:border-blue-300 transition-all shadow-sm"
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold ${
                    currentUser.role === "admin"
                      ? "bg-gradient-to-br from-slate-700 to-slate-900"
                      : "bg-gradient-to-br from-blue-500 to-purple-600"
                  }`}>
                    {currentUser.role === "admin" ? <FiShield size={13} /> : currentUser.name[0].toUpperCase()}
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-semibold text-slate-800 leading-none">{currentUser.name}</p>
                    <p className="text-[10px] text-slate-400 capitalize leading-none mt-0.5">{currentUser.role}</p>
                  </div>
                  <FiChevronDown size={13} className={`text-slate-400 transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50"
                    >
                      <div className="px-4 py-3 border-b border-slate-100">
                        <p className="text-sm font-semibold text-slate-800">{currentUser.name}</p>
                        <p className="text-xs text-slate-400">{currentUser.email}</p>
                      </div>
                      <Link
                        to="/map"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <FiMap size={14} className="text-blue-500" /> My Map
                      </Link>
                      {currentUser.role === "admin" && (
                        <Link
                          to="/admin"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <FiShield size={14} className="text-slate-500" /> Dashboard
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-slate-100"
                      >
                        <FiLogOut size={14} /> Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              /* Logged-out: two login buttons */
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  state={{ tab: "user" }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-50 transition-all"
                >
                  <FiUser size={13} /> User Login
                </Link>
                <Link
                  to="/login"
                  state={{ tab: "admin" }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-slate-700 to-slate-900 text-white text-xs font-medium hover:shadow-lg transition-all"
                >
                  <FiShield size={13} /> Admin Login
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-slate-100 bg-white/95 backdrop-blur-sm overflow-hidden"
          >
            <div className="px-4 py-3 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    pathname === link.to ? "bg-blue-50 text-blue-600" : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {link.icon && <link.icon size={14} />}
                  {link.label}
                </Link>
              ))}

              <div className="pt-2 border-t border-slate-100 space-y-2">
                <button
                  onClick={() => setLowBandwidth(!lowBandwidth)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium ${
                    lowBandwidth ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  <FiZap size={13} /> {lowBandwidth ? "Low-BW ON" : "Low-BW"}
                </button>

                {currentUser ? (
                  <div className="flex items-center justify-between px-1">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{currentUser.name}</p>
                      <p className="text-xs text-slate-400 capitalize">{currentUser.role}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 text-red-600 text-xs font-medium"
                    >
                      <FiLogOut size={13} /> Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Link
                      to="/login"
                      onClick={() => setMenuOpen(false)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-medium"
                    >
                      <FiUser size={13} /> User Login
                    </Link>
                    <Link
                      to="/login"
                      onClick={() => setMenuOpen(false)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-gradient-to-r from-slate-700 to-slate-900 text-white text-xs font-medium"
                    >
                      <FiShield size={13} /> Admin Login
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
