import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiArrowLeft, FiPhone, FiMail, FiGlobe, FiClock, FiMapPin,
  FiNavigation, FiAlertTriangle, FiCheckCircle
} from "react-icons/fi";
import { MdHouse, MdFastfood, MdLocalHospital, MdWarning } from "react-icons/md";
import MapPlaceholder from "../components/MapPlaceholder";
import { fetchResourceById } from "../utils/api";

const CATEGORY_META = {
  shelter: { icon: MdHouse, gradient: "from-blue-500 to-blue-700", light: "bg-blue-50 text-blue-700" },
  food: { icon: MdFastfood, gradient: "from-green-500 to-emerald-700", light: "bg-green-50 text-green-700" },
  clinic: { icon: MdLocalHospital, gradient: "from-rose-500 to-pink-700", light: "bg-rose-50 text-rose-700" },
  emergency: { icon: MdWarning, gradient: "from-orange-500 to-red-600", light: "bg-orange-50 text-orange-700" },
};

const AVAILABILITY_STYLE = {
  open: { cls: "bg-emerald-100 text-emerald-700 border-emerald-200", dot: "bg-emerald-500", label: "Open Now" },
  limited: { cls: "bg-amber-100 text-amber-700 border-amber-200", dot: "bg-amber-500", label: "Limited Availability" },
  closed: { cls: "bg-red-100 text-red-600 border-red-200", dot: "bg-red-500", label: "Currently Closed" },
};

export default function ResourceDetailsPage() {
  const { id } = useParams();
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportSent, setReportSent] = useState(false);

  useEffect(() => {
    fetchResourceById(id)
      .then((res) => setResource(res.data.data))
      .catch(() => setResource(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleReport = (e) => {
    e.preventDefault();
    setReportSent(true);
    setTimeout(() => { setReportOpen(false); setReportSent(false); }, 2000);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-32 mb-8" />
        <div className="h-48 bg-slate-200 rounded-3xl mb-6" />
        <div className="grid md:grid-cols-2 gap-6">
          <div className="h-64 bg-slate-200 rounded-2xl" />
          <div className="h-64 bg-slate-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-semibold text-slate-700 mb-2">Resource not found</h2>
        <Link to="/search" className="text-blue-600 hover:underline text-sm">← Back to search</Link>
      </div>
    );
  }

  const meta = CATEGORY_META[resource.category] || CATEGORY_META.shelter;
  const Icon = meta.icon;
  const avail = AVAILABILITY_STYLE[resource.availability] || AVAILABILITY_STYLE.closed;
  const occupancyPct = resource.capacity ? Math.round((resource.currentOccupancy / resource.capacity) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back */}
      <Link to="/search" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 text-sm mb-6 transition-colors">
        <FiArrowLeft size={16} /> Back to results
      </Link>

      {/* Hero Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${meta.gradient} text-white p-8 mb-6`}
      >
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "24px 24px" }}
        />
        <div className="relative flex flex-col sm:flex-row sm:items-start gap-5">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
            <Icon size={32} className="text-white" />
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${avail.cls}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${avail.dot} animate-pulse`} />
                {avail.label}
              </span>
              {resource.verified && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-white/20 text-white border border-white/30">
                  <FiCheckCircle size={11} /> Verified
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">{resource.name}</h1>
            <p className="text-white/80 text-sm flex items-center gap-1.5">
              <FiMapPin size={13} /> {resource.address}, {resource.city}
            </p>
          </div>
        </div>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-5">
          {/* Description */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6"
          >
            <h2 className="font-semibold text-slate-800 mb-3">About</h2>
            <p className="text-slate-600 text-sm leading-relaxed">{resource.description}</p>
            {resource.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {resource.tags.map((tag) => (
                  <span key={tag} className={`text-xs px-2.5 py-1 rounded-full font-medium ${meta.light}`}>
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6"
          >
            <h2 className="font-semibold text-slate-800 mb-4">Contact Information</h2>
            <div className="space-y-3">
              {[
                { icon: FiPhone, label: resource.phone, href: `tel:${resource.phone}` },
                { icon: FiMail, label: resource.email, href: `mailto:${resource.email}` },
                { icon: FiGlobe, label: resource.website, href: resource.website },
                { icon: FiClock, label: resource.hours },
                { icon: FiMapPin, label: `${resource.address}, ${resource.city}` },
              ].filter((i) => i.label).map((item, idx) => {
                const ItemIcon = item.icon;
                return (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                      <ItemIcon className="text-slate-500" size={14} />
                    </div>
                    {item.href ? (
                      <a href={item.href} target="_blank" rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline break-all mt-1.5">
                        {item.label}
                      </a>
                    ) : (
                      <span className="text-sm text-slate-600 mt-1.5">{item.label}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Capacity */}
          {resource.capacity && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6"
            >
              <h2 className="font-semibold text-slate-800 mb-4">Capacity</h2>
              <div className="flex justify-between text-sm text-slate-500 mb-2">
                <span>Current occupancy</span>
                <span className="font-medium text-slate-700">{resource.currentOccupancy} / {resource.capacity}</span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${occupancyPct}%` }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                  className={`h-full rounded-full ${
                    occupancyPct > 80 ? "bg-red-400" : occupancyPct > 50 ? "bg-amber-400" : "bg-emerald-400"
                  }`}
                />
              </div>
              <p className="text-xs text-slate-400 mt-2">{occupancyPct}% full</p>
            </motion.div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-5">
          {/* Map */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <MapPlaceholder address={`${resource.address}, ${resource.city}`} name={resource.name} height="h-72" />
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-3"
          >
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(resource.address + ", " + resource.city)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold hover:shadow-lg hover:shadow-blue-200 transition-all hover:scale-[1.02]"
            >
              <FiNavigation size={18} /> Get Directions
            </a>
            <button
              onClick={() => setReportOpen(true)}
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-all text-sm"
            >
              <FiAlertTriangle size={16} /> Report an Issue
            </button>
          </motion.div>
        </div>
      </div>

      {/* Report Modal */}
      {reportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-md"
          >
            {reportSent ? (
              <div className="text-center py-6">
                <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiCheckCircle className="text-emerald-600" size={28} />
                </div>
                <h3 className="font-semibold text-slate-800 mb-1">Report Submitted</h3>
                <p className="text-slate-500 text-sm">Thank you for helping keep our data accurate.</p>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-5">
                  <h3 className="font-semibold text-slate-800">Report an Issue</h3>
                  <button onClick={() => setReportOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
                </div>
                <form onSubmit={handleReport} className="space-y-4">
                  <select className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-400">
                    <option>Incorrect information</option>
                    <option>Resource is closed</option>
                    <option>Wrong address</option>
                    <option>Other</option>
                  </select>
                  <textarea
                    rows={3}
                    placeholder="Additional details..."
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-400 resize-none"
                  />
                  <button type="submit" className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium text-sm">
                    Submit Report
                  </button>
                </form>
              </>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
