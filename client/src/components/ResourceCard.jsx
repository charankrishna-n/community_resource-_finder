import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FiMapPin, FiPhone, FiClock, FiArrowRight } from "react-icons/fi";
import { MdLocalHospital, MdFastfood, MdHouse, MdWarning } from "react-icons/md";
import { useApp } from "../utils/AppContext";

const CATEGORY_META = {
  shelter: { icon: MdHouse, color: "blue", bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-100" },
  food: { icon: MdFastfood, color: "green", bg: "bg-green-50", text: "text-green-600", border: "border-green-100" },
  clinic: { icon: MdLocalHospital, color: "rose", bg: "bg-rose-50", text: "text-rose-600", border: "border-rose-100" },
  emergency: { icon: MdWarning, color: "orange", bg: "bg-orange-50", text: "text-orange-600", border: "border-orange-100" },
};

const AVAILABILITY_BADGE = {
  open: "bg-emerald-100 text-emerald-700",
  limited: "bg-amber-100 text-amber-700",
  closed: "bg-red-100 text-red-600",
};

export default function ResourceCard({ resource, index = 0 }) {
  const { lowBandwidth } = useApp();
  const meta = CATEGORY_META[resource.category] || CATEGORY_META.shelter;
  const Icon = meta.icon;

  if (lowBandwidth) {
    return (
      <div className="border border-slate-200 rounded-xl p-4 bg-white">
        <div className="flex justify-between items-start">
          <div>
            <p className="font-semibold text-slate-800">{resource.name}</p>
            <p className="text-sm text-slate-500">{resource.address}</p>
            <p className="text-sm text-slate-500">{resource.distance} km away · {resource.hours}</p>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${AVAILABILITY_BADGE[resource.availability]}`}>
            {resource.availability}
          </span>
        </div>
        <Link to={`/resource/${resource.id}`} className="mt-3 block text-center py-2 rounded-lg bg-blue-600 text-white text-sm font-medium">
          View Details
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="card-hover bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden group"
    >
      {/* Top accent bar */}
      <div className={`h-1 w-full bg-gradient-to-r ${
        resource.category === "shelter" ? "from-blue-400 to-blue-600" :
        resource.category === "food" ? "from-green-400 to-emerald-600" :
        resource.category === "clinic" ? "from-rose-400 to-pink-600" :
        "from-orange-400 to-red-500"
      }`} />

      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className={`w-10 h-10 rounded-xl ${meta.bg} ${meta.border} border flex items-center justify-center`}>
            <Icon className={meta.text} size={20} />
          </div>
          <div className="flex items-center gap-2">
            {resource.verified && (
              <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium border border-blue-100">
                ✓ Verified
              </span>
            )}
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${AVAILABILITY_BADGE[resource.availability]}`}>
              {resource.availability}
            </span>
          </div>
        </div>

        <h3 className="font-semibold text-slate-800 text-base mb-1 group-hover:text-blue-600 transition-colors">
          {resource.name}
        </h3>
        <p className="text-slate-500 text-sm line-clamp-2 mb-4">{resource.description}</p>

        <div className="space-y-1.5 mb-4">
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <FiMapPin size={13} className="shrink-0" />
            <span className="truncate">{resource.city}{resource.country ? `, ${resource.country}` : ""}</span>
            <span className="ml-auto shrink-0 text-xs font-semibold text-blue-500">{resource.distance} km</span>
          </div>
          <p className="text-xs text-slate-400 pl-5 truncate">{resource.address}</p>
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <FiClock size={13} className="shrink-0" />
            <span>{resource.hours}</span>
          </div>
          {resource.phone && (
            <div className="flex items-center gap-2 text-slate-500 text-sm">
              <FiPhone size={13} className="shrink-0" />
              <span>{resource.phone}</span>
            </div>
          )}
        </div>

        {/* Capacity bar */}
        {resource.capacity && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Capacity</span>
              <span>{resource.currentOccupancy}/{resource.capacity}</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  resource.currentOccupancy / resource.capacity > 0.8 ? "bg-red-400" :
                  resource.currentOccupancy / resource.capacity > 0.5 ? "bg-amber-400" : "bg-emerald-400"
                }`}
                style={{ width: `${(resource.currentOccupancy / resource.capacity) * 100}%` }}
              />
            </div>
          </div>
        )}

        <Link
          to={`/resource/${resource.id}`}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium hover:shadow-lg hover:shadow-blue-200 transition-all group"
        >
          View Details
          <FiArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </motion.div>
  );
}
