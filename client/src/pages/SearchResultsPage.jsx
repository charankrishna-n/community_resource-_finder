import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiFilter, FiSearch, FiX, FiMapPin, FiNavigation, FiAlertCircle, FiLoader } from "react-icons/fi";
import ResourceCard from "../components/ResourceCard";
import { fetchResources } from "../utils/api";
import { geocodeAddress } from "../utils/geo";

const CATEGORIES = ["all", "shelter", "food", "clinic", "emergency"];
const DISTANCES = [
  { label: "Any distance", value: "" },
  { label: "Under 1 km",   value: "1" },
  { label: "Under 2 km",   value: "2" },
  { label: "Under 5 km",   value: "5" },
  { label: "Under 10 km",  value: "10" },
];
const AVAILABILITY = ["all", "open", "limited", "closed"];

export default function SearchResultsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // ── state ──────────────────────────────────────────────────────────────────
  const [locationInput, setLocationInput] = useState(searchParams.get("location") || "");
  const [keywordInput,  setKeywordInput]  = useState(searchParams.get("search")   || "");
  const [category,      setCategory]      = useState(searchParams.get("category") || "all");
  const [availability,  setAvailability]  = useState("all");
  const [maxDistance,   setMaxDistance]   = useState("");

  const [resources,     setResources]     = useState([]);
  const [userCoords,    setUserCoords]    = useState(null);   // geocoded from input
  const [geoLabel,      setGeoLabel]      = useState("");     // human-readable resolved name
  const [geoError,      setGeoError]      = useState("");
  const [geocoding,     setGeocoding]     = useState(false);
  const [loading,       setLoading]       = useState(true);
  const [showMap,       setShowMap]       = useState(false);
  const [sidebarOpen,   setSidebarOpen]   = useState(false);
  const [mapKey,        setMapKey]        = useState(0);

  // ── geocode the location input ─────────────────────────────────────────────
  const resolveLocation = useCallback(async (address) => {
    if (!address.trim()) {
      setUserCoords(null);
      setGeoLabel("");
      setGeoError("");
      return;
    }
    setGeocoding(true);
    setGeoError("");
    const result = await geocodeAddress(address);
    setGeocoding(false);
    if (result) {
      setUserCoords({ lat: result.lat, lng: result.lng });
      setGeoLabel(result.displayName);
      setMapKey((k) => k + 1);
    } else {
      setUserCoords(null);
      setGeoLabel("");
      setGeoError(`Could not find "${address}". Try a more specific address or city name.`);
    }
  }, []);

  // Geocode on mount if location param already present
  useEffect(() => {
    const loc = searchParams.get("location");
    if (loc) resolveLocation(loc);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── fetch resources from API ───────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const params = {};
        if (keywordInput)             params.search       = keywordInput;
        if (category !== "all")       params.category     = category;
        if (availability !== "all")   params.availability = availability;

        if (userCoords) {
          // Send real coords to backend — it computes haversine + sorts
          params.lat = userCoords.lat;
          params.lng = userCoords.lng;
          if (maxDistance) params.radius = maxDistance;
          // Always get at least 6 closest results even if far away
          params.fallback = true;
        } else if (maxDistance) {
          params.maxDistance = maxDistance;
        }

        const res = await fetchResources(params);
        setResources(res.data.data);
      } catch {
        setResources([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [keywordInput, category, availability, maxDistance, userCoords]);

  // ── helpers ────────────────────────────────────────────────────────────────
  const handleLocationSearch = (e) => {
    e.preventDefault();
    setSearchParams((p) => {
      p.set("location", locationInput);
      if (keywordInput) p.set("search", keywordInput); else p.delete("search");
      p.set("category", category);
      return p;
    });
    resolveLocation(locationInput);
  };

  const updateCategory = (val) => {
    setCategory(val);
    setSearchParams((p) => { p.set("category", val); return p; });
  };

  // Google Maps embed — search by resolved label so the map shows the area name
  const mapSrc = userCoords
    ? `https://www.google.com/maps?q=${encodeURIComponent(geoLabel || locationInput)}&z=13&output=embed`
    : null;

  // ── filter panel (extracted so it can be used in both sidebar and drawer) ──
  const FilterPanel = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Category</h3>
        <div className="space-y-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => updateCategory(cat)}
              className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium capitalize transition-all ${
                category === cat
                  ? "bg-blue-50 text-blue-600 border border-blue-100"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {cat === "all" ? "All Categories" : cat}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Distance</h3>
        <div className="space-y-1">
          {DISTANCES.map((d) => (
            <button
              key={d.value}
              onClick={() => setMaxDistance(d.value)}
              className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                maxDistance === d.value
                  ? "bg-blue-50 text-blue-600 border border-blue-100"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Availability</h3>
        <div className="space-y-1">
          {AVAILABILITY.map((a) => (
            <button
              key={a}
              onClick={() => setAvailability(a)}
              className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium capitalize transition-all ${
                availability === a
                  ? "bg-blue-50 text-blue-600 border border-blue-100"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {a === "all" ? "All" : a}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* ── Location + Keyword Search Bar ── */}
      <form onSubmit={handleLocationSearch} className="flex flex-col sm:flex-row gap-3 mb-4">
        {/* Location input */}
        <div className={`flex-1 flex items-center gap-3 bg-white border rounded-2xl px-4 py-3 shadow-sm transition-colors ${
          geoError ? "border-red-300" : "border-slate-200 focus-within:border-blue-400"
        }`}>
          <FiMapPin className={`shrink-0 ${geoError ? "text-red-400" : "text-blue-400"}`} size={17} />
          <input
            type="text"
            placeholder="Enter location (city, address, postcode…)"
            value={locationInput}
            onChange={(e) => { setLocationInput(e.target.value); setGeoError(""); }}
            className="flex-1 outline-none text-sm text-slate-700 placeholder-slate-400"
          />
          {geocoding && <FiLoader size={15} className="text-blue-400 animate-spin shrink-0" />}
          {locationInput && !geocoding && (
            <button type="button" onClick={() => { setLocationInput(""); setUserCoords(null); setGeoLabel(""); setGeoError(""); }}
              className="text-slate-400 hover:text-slate-600">
              <FiX size={15} />
            </button>
          )}
        </div>

        {/* Keyword input */}
        <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm focus-within:border-blue-400 transition-colors sm:w-56">
          <FiSearch className="text-slate-400 shrink-0" size={16} />
          <input
            type="text"
            placeholder="Keyword (shelter, food…)"
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            className="flex-1 outline-none text-sm text-slate-700 placeholder-slate-400"
          />
          {keywordInput && (
            <button type="button" onClick={() => setKeywordInput("")} className="text-slate-400 hover:text-slate-600">
              <FiX size={15} />
            </button>
          )}
        </div>

        <button
          type="submit"
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold text-sm hover:shadow-lg hover:shadow-blue-200 transition-all"
        >
          <FiSearch size={15} /> Search
        </button>

        <button
          type="button"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="md:hidden flex items-center gap-2 px-4 py-3 rounded-2xl bg-white border border-slate-200 text-slate-600 text-sm font-medium shadow-sm"
        >
          <FiFilter size={16} /> Filters
        </button>

        <button
          type="button"
          onClick={() => setShowMap(!showMap)}
          className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-white border border-slate-200 text-slate-600 text-sm font-medium shadow-sm hover:bg-slate-50 transition-colors"
        >
          <FiMapPin size={16} /> {showMap ? "Hide Map" : "Show Map"}
        </button>
      </form>

      {/* ── Geo error ── */}
      <AnimatePresence>
        {geoError && (
          <motion.div
            initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm rounded-2xl px-4 py-3 mb-4"
          >
            <FiAlertCircle size={15} className="shrink-0" />
            {geoError}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Resolved location pill ── */}
      <AnimatePresence>
        {geoLabel && !geoError && (
          <motion.div
            initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium mb-4"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Showing results near: <span className="font-semibold truncate max-w-xs">{geoLabel}</span>
            {userCoords && (
              <a
                href={`https://www.google.com/maps/@${userCoords.lat},${userCoords.lng},14z`}
                target="_blank" rel="noopener noreferrer"
                className="ml-1 text-emerald-600 hover:text-emerald-800"
                title="Open in Google Maps"
              >
                <FiNavigation size={12} />
              </a>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Map embed ── */}
      <AnimatePresence>
        {showMap && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 overflow-hidden"
          >
            <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm" style={{ height: "280px" }}>
              {mapSrc ? (
                <iframe
                  key={mapKey}
                  title="Location Map"
                  src={mapSrc}
                  width="100%" height="100%"
                  style={{ border: 0 }}
                  allowFullScreen loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              ) : (
                <div className="h-full flex flex-col items-center justify-center gap-3 bg-slate-50 text-slate-400">
                  <FiMapPin size={32} className="text-slate-300" />
                  <p className="text-sm">Enter a location above to see the map</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-6">
        {/* ── Desktop Sidebar ── */}
        <aside className="hidden md:block w-56 shrink-0">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sticky top-24">
            <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <FiFilter size={16} /> Filters
            </h2>
            <FilterPanel />
          </div>
        </aside>

        {/* ── Mobile Sidebar Drawer ── */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 md:hidden"
            >
              <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
              <motion.div
                initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }}
                className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-xl p-6 overflow-y-auto"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="font-semibold text-slate-800">Filters</h2>
                  <button onClick={() => setSidebarOpen(false)}><FiX size={20} /></button>
                </div>
                <FilterPanel />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Results ── */}
        <main className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-slate-500">
              {loading
                ? "Searching..."
                : `${resources.length} resource${resources.length !== 1 ? "s" : ""} found${
                    userCoords ? " · sorted by distance" : ""
                  }`}
            </p>
          </div>

          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 animate-pulse">
                  <div className="h-10 w-10 bg-slate-200 rounded-xl mb-4" />
                  <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-slate-100 rounded w-full mb-1" />
                  <div className="h-3 bg-slate-100 rounded w-2/3 mb-4" />
                  <div className="h-10 bg-slate-200 rounded-xl" />
                </div>
              ))}
            </div>
          ) : resources.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FiSearch className="text-slate-400" size={28} />
              </div>
              <h3 className="font-semibold text-slate-700 mb-2">No resources found</h3>
              <p className="text-slate-400 text-sm mb-4">
                {geoError
                  ? "Fix the location above and try again."
                  : "Try adjusting your filters, distance, or search terms."}
              </p>
              <button
                onClick={() => { setMaxDistance(""); setAvailability("all"); setCategory("all"); setKeywordInput(""); }}
                className="px-4 py-2 rounded-xl bg-blue-50 text-blue-600 text-sm font-medium hover:bg-blue-100 transition-colors"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {resources.map((r, i) => (
                <ResourceCard key={r.id} resource={r} index={i} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
