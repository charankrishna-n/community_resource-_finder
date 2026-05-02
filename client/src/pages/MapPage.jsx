import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiNavigation, FiMapPin, FiRefreshCw, FiAlertCircle,
  FiSearch, FiArrowRight, FiCrosshair, FiX, FiLoader,
} from "react-icons/fi";
import { MdHouse, MdFastfood, MdLocalHospital, MdWarning } from "react-icons/md";
import { useApp } from "../utils/AppContext";
import { fetchResources } from "../utils/api";
import { geocodeAddress, haversineKm } from "../utils/geo";

const CATEGORY_ICONS = {
  shelter: MdHouse,
  food: MdFastfood,
  clinic: MdLocalHospital,
  emergency: MdWarning,
};

const CATEGORY_COLORS = {
  shelter:   "text-blue-600 bg-blue-50 border-blue-200",
  food:      "text-green-600 bg-green-50 border-green-200",
  clinic:    "text-rose-600 bg-rose-50 border-rose-200",
  emergency: "text-orange-600 bg-orange-50 border-orange-200",
};

export default function MapPage() {
  const { currentUser } = useApp();
  const navigate = useNavigate();

  const [coords,          setCoords]          = useState(null);
  const [geoLabel,        setGeoLabel]        = useState("");
  const [geoError,        setGeoError]        = useState("");
  const [locating,        setLocating]        = useState(true);   // GPS fetch in progress
  const [geocoding,       setGeocoding]       = useState(false);  // address geocode in progress
  const [locationInput,   setLocationInput]   = useState("");
  const [resources,       setResources]       = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [mapKey,          setMapKey]          = useState(0);

  // ── GPS on mount ────────────────────────────────────────────────────────────
  const getGPSLocation = () => {
    setLocating(true);
    setGeoError("");
    if (!navigator.geolocation) {
      setGeoError("Geolocation not supported — type an address below.");
      setLocating(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const c = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCoords(c);
        setGeoLabel(`${c.lat.toFixed(5)}, ${c.lng.toFixed(5)}`);
        setLocating(false);
        setMapKey((k) => k + 1);
      },
      (err) => {
        setGeoError(`GPS denied (${err.message}). Type an address below to search manually.`);
        setLocating(false);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  useEffect(() => { getGPSLocation(); }, []);

  // ── Manual address geocode ──────────────────────────────────────────────────
  const handleAddressSearch = async (e) => {
    e.preventDefault();
    if (!locationInput.trim()) return;
    setGeocoding(true);
    setGeoError("");
    const result = await geocodeAddress(locationInput);
    setGeocoding(false);
    if (result) {
      setCoords({ lat: result.lat, lng: result.lng });
      setGeoLabel(result.displayName);
      setMapKey((k) => k + 1);
    } else {
      setGeoError(`Could not find "${locationInput}". Try a more specific address.`);
    }
  };

  // ── Load + sort resources by real distance ──────────────────────────────────
  useEffect(() => {
    if (!coords) return;
    const params = selectedCategory !== "all" ? { category: selectedCategory } : {};
    fetchResources(params)
      .then((r) => {
        const sorted = r.data.data
          .map((res) => ({
            ...res,
            distance: parseFloat(haversineKm(coords.lat, coords.lng, res.lat, res.lng).toFixed(1)),
          }))
          .sort((a, b) => a.distance - b.distance);
        setResources(sorted);
      })
      .catch(() => setResources([]));
  }, [coords, selectedCategory]);

  // ── Google Maps embed URL ───────────────────────────────────────────────────
  const mapSrc = coords
    ? `https://www.google.com/maps?q=${coords.lat},${coords.lng}&z=14&output=embed`
    : null;

  const directionsUrl = (address, city) =>
    `https://www.google.com/maps/dir/?api=1&origin=${coords?.lat},${coords?.lng}&destination=${encodeURIComponent(`${address}, ${city}`)}`;

  const filteredResources = resources.filter(
    (r) => selectedCategory === "all" || r.category === selectedCategory
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <FiMapPin className="text-blue-500" size={24} />
            Resources Near You
          </h1>
          {currentUser && (
            <p className="text-slate-500 text-sm mt-0.5">
              Welcome, <span className="font-medium text-slate-700">{currentUser.name}</span>
            </p>
          )}
        </div>
        <button
          onClick={getGPSLocation}
          disabled={locating}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-all shadow-sm disabled:opacity-60"
        >
          {locating ? <FiRefreshCw size={15} className="animate-spin" /> : <FiCrosshair size={15} />}
          {locating ? "Locating…" : "Use My GPS"}
        </button>
      </div>

      {/* ── Manual address search ── */}
      <form onSubmit={handleAddressSearch} className="flex gap-2 mb-4">
        <div className={`flex-1 flex items-center gap-3 bg-white border rounded-2xl px-4 py-3 shadow-sm transition-colors ${
          geoError ? "border-red-300" : "border-slate-200 focus-within:border-blue-400"
        }`}>
          <FiMapPin className="text-blue-400 shrink-0" size={16} />
          <input
            type="text"
            placeholder="Or type an address / city / postcode…"
            value={locationInput}
            onChange={(e) => { setLocationInput(e.target.value); setGeoError(""); }}
            className="flex-1 outline-none text-sm text-slate-700 placeholder-slate-400"
          />
          {geocoding && <FiLoader size={14} className="text-blue-400 animate-spin shrink-0" />}
          {locationInput && !geocoding && (
            <button type="button" onClick={() => setLocationInput("")} className="text-slate-400 hover:text-slate-600">
              <FiX size={14} />
            </button>
          )}
        </div>
        <button
          type="submit"
          disabled={geocoding || !locationInput.trim()}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium text-sm hover:shadow-lg transition-all disabled:opacity-60"
        >
          <FiSearch size={15} /> Go
        </button>
      </form>

      {/* ── Error banner ── */}
      <AnimatePresence>
        {geoError && (
          <motion.div
            initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 mb-4 text-sm text-amber-700"
          >
            <FiAlertCircle size={15} className="shrink-0 mt-0.5" />
            {geoError}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Resolved location pill ── */}
      <AnimatePresence>
        {coords && geoLabel && !locating && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium mb-5"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="truncate max-w-xs">{geoLabel}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid lg:grid-cols-5 gap-6">

        {/* ── Map (3/5) ── */}
        <div className="lg:col-span-3">
          <div
            className="rounded-3xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100 relative"
            style={{ height: "520px" }}
          >
            {locating && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-50 z-10">
                <div className="w-14 h-14 rounded-full border-4 border-blue-200 border-t-blue-500 animate-spin" />
                <p className="text-slate-500 text-sm font-medium">Getting your location…</p>
              </div>
            )}

            {!locating && !coords && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-50 text-slate-400">
                <FiMapPin size={40} className="text-slate-300" />
                <p className="text-sm font-medium">Allow GPS or type an address above</p>
              </div>
            )}

            {!locating && mapSrc && (
              <iframe
                key={mapKey}
                title="Location Map"
                src={mapSrc}
                width="100%" height="100%"
                style={{ border: 0 }}
                allowFullScreen loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            )}
          </div>

          {coords && (
            <a
              href={`https://www.google.com/maps/@${coords.lat},${coords.lng},14z`}
              target="_blank" rel="noopener noreferrer"
              className="mt-3 flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium text-sm hover:shadow-lg hover:shadow-blue-200 transition-all"
            >
              <FiNavigation size={15} /> Open Full Map in Google Maps
            </a>
          )}
        </div>

        {/* ── Resource list (2/5) ── */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Category chips */}
          <div className="flex flex-wrap gap-2">
            {["all", "shelter", "food", "clinic", "emergency"].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize border transition-all ${
                  selectedCategory === cat
                    ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                    : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"
                }`}
              >
                {cat === "all" ? "All" : cat}
              </button>
            ))}
          </div>

          {/* Count */}
          {coords && (
            <p className="text-xs text-slate-400">
              {filteredResources.length} resource{filteredResources.length !== 1 ? "s" : ""} · sorted by distance
            </p>
          )}

          {/* List */}
          <div className="space-y-3 overflow-y-auto pr-1" style={{ maxHeight: "460px" }}>
            {!coords ? (
              <div className="text-center py-12 text-slate-400 text-sm">
                Set a location to see nearby resources
              </div>
            ) : filteredResources.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm">No resources found</div>
            ) : (
              filteredResources.map((r, i) => {
                const Icon = CATEGORY_ICONS[r.category] || FiMapPin;
                const colorCls = CATEGORY_COLORS[r.category] || "text-slate-600 bg-slate-50 border-slate-200";
                return (
                  <motion.div
                    key={r.id}
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 hover:border-blue-200 transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${colorCls}`}>
                        <Icon size={17} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-semibold text-slate-800 text-sm truncate">{r.name}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${
                            r.availability === "open"    ? "bg-emerald-100 text-emerald-700" :
                            r.availability === "limited" ? "bg-amber-100 text-amber-700" :
                                                           "bg-red-100 text-red-600"
                          }`}>
                            {r.availability}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5 truncate">{r.address}</p>
                        <p className="text-xs font-medium text-blue-500 mt-0.5">{r.distance} km away · {r.hours}</p>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-3">
                      <a
                        href={directionsUrl(r.address, r.city)}
                        target="_blank" rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-blue-50 text-blue-600 text-xs font-medium hover:bg-blue-100 transition-colors border border-blue-100"
                      >
                        <FiNavigation size={12} /> Directions
                      </a>
                      <button
                        onClick={() => navigate(`/resource/${r.id}`)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-slate-50 text-slate-600 text-xs font-medium hover:bg-slate-100 transition-colors border border-slate-200"
                      >
                        <FiSearch size={12} /> Details <FiArrowRight size={11} />
                      </button>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
