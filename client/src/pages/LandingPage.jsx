import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiSearch, FiMapPin, FiArrowRight, FiShield, FiHeart, FiUsers } from "react-icons/fi";
import { MdHouse, MdFastfood, MdLocalHospital, MdWarning } from "react-icons/md";

const CATEGORIES = [
  { id: "shelter", label: "Shelter", icon: MdHouse, color: "from-blue-400 to-blue-600", bg: "bg-blue-50 hover:bg-blue-100 border-blue-200" },
  { id: "food", label: "Food", icon: MdFastfood, color: "from-green-400 to-emerald-600", bg: "bg-green-50 hover:bg-green-100 border-green-200" },
  { id: "clinic", label: "Clinics", icon: MdLocalHospital, color: "from-rose-400 to-pink-600", bg: "bg-rose-50 hover:bg-rose-100 border-rose-200" },
  { id: "emergency", label: "Emergency", icon: MdWarning, color: "from-orange-400 to-red-500", bg: "bg-orange-50 hover:bg-orange-100 border-orange-200" },
];

const STATS = [
  { icon: FiShield, value: "500+", label: "Verified Resources" },
  { icon: FiUsers, value: "12K+", label: "People Helped" },
  { icon: FiHeart, value: "24/7", label: "Always Available" },
];

const fadeUp = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0 } };

export default function LandingPage() {
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("all");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (location.trim()) params.set("location", location.trim());
    if (category !== "all") params.set("category", category);
    navigate(`/search?${params.toString()}`);
  };

  const handleCategoryClick = (cat) => {
    navigate(`/search?category=${cat}`);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-purple-950 text-white">
        {/* Animated blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ scale: [1, 1.2, 1], x: [0, 30, 0], y: [0, -20, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-32 -left-32 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ scale: [1, 1.3, 1], x: [0, -20, 0], y: [0, 30, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute -bottom-32 -right-32 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl"
          />
        </div>

        {/* Dot grid overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-36 text-center">
          <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-sm text-blue-200 mb-6 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Free · Instant · Reliable
            </span>
          </motion.div>

          <motion.h1
            variants={fadeUp} initial="hidden" animate="show" transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight mb-6"
          >
            Find Help Near You,{" "}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Instantly
            </span>
          </motion.h1>

          <motion.p
            variants={fadeUp} initial="hidden" animate="show" transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-blue-100/80 max-w-2xl mx-auto mb-10"
          >
            Discover shelters, food banks, clinics, and emergency services near you — fast, free, and accessible to everyone.
          </motion.p>

          {/* Search Bar */}
          <motion.form
            variants={fadeUp} initial="hidden" animate="show" transition={{ duration: 0.6, delay: 0.3 }}
            onSubmit={handleSearch}
            className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto"
          >
            <div className="flex-1 flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-3">
              <FiMapPin className="text-blue-300 shrink-0" size={18} />
              <input
                type="text"
                placeholder="Enter your location..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="flex-1 bg-transparent text-white placeholder-blue-200/60 outline-none text-sm"
              />
            </div>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-3 sm:w-44">
              <FiSearch className="text-blue-300 shrink-0" size={16} />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="flex-1 bg-transparent text-white outline-none text-sm cursor-pointer"
              >
                <option value="all" className="text-slate-800">All Categories</option>
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id} className="text-slate-800">{c.label}</option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold hover:shadow-xl hover:shadow-blue-500/30 transition-all hover:scale-105 active:scale-95"
            >
              Find Resources
              <FiArrowRight size={16} />
            </button>
          </motion.form>
        </div>
      </section>

      {/* Quick Category Buttons */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4"
        >
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className={`card-hover flex flex-col items-center gap-3 p-5 rounded-2xl border bg-white shadow-sm ${cat.bg} transition-all`}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center shadow-md`}>
                  <Icon className="text-white" size={24} />
                </div>
                <span className="font-semibold text-slate-700 text-sm">{cat.label}</span>
              </button>
            );
          })}
        </motion.div>
      </section>

      {/* Stats */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-3 gap-6">
          {STATS.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-100 flex items-center justify-center mx-auto mb-3">
                  <Icon className="text-blue-600" size={22} />
                </div>
                <p className="text-2xl font-bold gradient-text">{stat.value}</p>
                <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gradient-to-br from-blue-50 to-purple-50 py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-slate-800 mb-3">How It Works</h2>
            <p className="text-slate-500">Three simple steps to find the help you need</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Enter Your Location", desc: "Type your address or allow location access for instant nearby results." },
              { step: "02", title: "Choose a Category", desc: "Filter by shelter, food, clinics, or emergency services." },
              { step: "03", title: "Get Directions", desc: "View full details and get directions to the resource instantly." },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-white/80 text-center"
              >
                <span className="text-4xl font-black gradient-text">{item.step}</span>
                <h3 className="font-semibold text-slate-800 mt-3 mb-2">{item.title}</h3>
                <p className="text-slate-500 text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 to-purple-700 p-10 text-center text-white"
        >
          <div className="absolute inset-0 opacity-10 pointer-events-none"
            style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "24px 24px" }}
          />
          <h2 className="text-3xl font-bold mb-3 relative">Need Help Right Now?</h2>
          <p className="text-blue-100 mb-6 relative">Our database is updated in real-time. Find verified resources near you.</p>
          <Link
            to="/search"
            className="relative z-10 inline-flex items-center gap-2 px-8 py-3 rounded-2xl bg-white text-blue-700 font-semibold hover:shadow-xl transition-all hover:scale-105 active:scale-95"
          >
            Find Resources Now <FiArrowRight size={16} />
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
