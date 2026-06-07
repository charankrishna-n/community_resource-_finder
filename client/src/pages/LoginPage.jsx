import { useState } from "react";
import { useNavigate, Link, useLocation, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiMail, FiLock, FiArrowRight, FiShield, FiUser, FiAlertCircle, FiEye, FiEyeOff } from "react-icons/fi";
import { useApp } from "../utils/AppContext";

const TABS = [
  {
    id: "user",
    label: "User Login",
    icon: FiUser,
    accent: "from-blue-500 to-purple-600",
    hint: { email: "user@communityfinder.org", password: "user123" },
    description: "Find resources near you",
  },
  {
    id: "admin",
    label: "Admin Login",
    icon: FiShield,
    accent: "from-slate-700 to-slate-900",
    hint: { email: "admin@communityfinder.org", password: "admin123" },
    description: "Manage the resource database",
  },
];

export default function LoginPage() {
  const { login, currentUser } = useApp();
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();
  const roleParam = searchParams.get("role");
  const activeTab = roleParam || "user";
  const isRoleSelected = !!roleParam;

  const setActiveTab = (tabId) => {
    setSearchParams({ role: tabId });
    setForm({ email: "", password: "" });
    setError("");
  };

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Already logged in — redirect
  if (currentUser) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
            <FiUser className="text-white" size={28} />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-1">Already signed in</h2>
          <p className="text-slate-500 text-sm mb-5">Welcome back, <strong>{currentUser.name}</strong></p>
          <button
            onClick={() => navigate(currentUser.role === "admin" ? "/admin" : "/map")}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium text-sm"
          >
            Go to {currentUser.role === "admin" ? "Dashboard" : "Map"}
          </button>
        </div>
      </div>
    );
  }

  const tab = TABS.find((t) => t.id === activeTab) || TABS[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600)); // simulate network
    const result = login(form.email, form.password);
    setLoading(false);
    if (result.success) {
      navigate(result.user.role === "admin" ? "/admin" : "/map");
    } else {
      setError(result.message);
    }
  };

  const fillDemo = () => {
    setForm({ email: tab.hint.email, password: tab.hint.password });
    setError("");
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${tab.accent} flex items-center justify-center mx-auto mb-4 shadow-lg transition-all duration-300`}>
            <tab.icon className="text-white" size={28} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Welcome back</h1>
          <p className="text-slate-500 text-sm mt-1">{tab.description}</p>
        </div>

        {/* Tab Switcher */}
        {!isRoleSelected && (
          <div className="flex bg-slate-100 rounded-2xl p-1 mb-6">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => { setActiveTab(t.id); setForm({ email: "", password: "" }); setError(""); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  activeTab === t.id
                    ? "bg-white text-slate-800 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <t.icon size={15} />
                {t.label}
              </button>
            ))}
          </div>
        )}

        {/* Form Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: activeTab === "admin" ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8"
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Email Address</label>
                <div className={`flex items-center gap-3 border rounded-xl px-4 py-3 transition-colors ${
                  error ? "border-red-300 bg-red-50" : "border-slate-200 focus-within:border-blue-400"
                }`}>
                  <FiMail className="text-slate-400 shrink-0" size={16} />
                  <input
                    type="email"
                    required
                    placeholder={tab.hint.email}
                    value={form.email}
                    onChange={(e) => { setForm((p) => ({ ...p, email: e.target.value })); setError(""); }}
                    className="flex-1 outline-none text-sm text-slate-700 placeholder-slate-300 bg-transparent"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Password</label>
                <div className={`flex items-center gap-3 border rounded-xl px-4 py-3 transition-colors ${
                  error ? "border-red-300 bg-red-50" : "border-slate-200 focus-within:border-blue-400"
                }`}>
                  <FiLock className="text-slate-400 shrink-0" size={16} />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => { setForm((p) => ({ ...p, password: e.target.value })); setError(""); }}
                    className="flex-1 outline-none text-sm text-slate-700 placeholder-slate-300 bg-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                  </button>
                </div>
              </div>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-100 rounded-xl px-4 py-2.5"
                  >
                    <FiAlertCircle size={15} className="shrink-0" />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className={`flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-gradient-to-r ${tab.accent} text-white font-semibold hover:shadow-lg transition-all mt-1 disabled:opacity-70`}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  <>Sign In <FiArrowRight size={16} /></>
                )}
              </button>
            </form>

            {/* Demo hint */}
            <div className="mt-5 pt-5 border-t border-slate-100">
              <p className="text-center text-xs text-slate-400 mb-2">Demo credentials</p>
              <button
                onClick={fillDemo}
                className="w-full text-xs text-slate-500 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 transition-colors font-mono"
              >
                {tab.hint.email} / {tab.hint.password}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>

        {!isRoleSelected && (
          <p className="text-center text-xs text-slate-400 mt-5">
            {activeTab === "user" ? (
              <>Looking to manage resources?{" "}
                <button onClick={() => setActiveTab("admin")} className="text-blue-500 hover:underline">Admin login →</button>
              </>
            ) : (
              <>Just need to find help?{" "}
                <button onClick={() => setActiveTab("user")} className="text-blue-500 hover:underline">User login →</button>
              </>
            )}
          </p>
        )}
      </motion.div>
    </div>
  );
}
