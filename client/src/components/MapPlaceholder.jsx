import { FiMap, FiNavigation } from "react-icons/fi";

export default function MapPlaceholder({ address, name, height = "h-64" }) {
  const query = encodeURIComponent(address || name || "");
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;

  return (
    <div className={`${height} rounded-2xl overflow-hidden relative bg-gradient-to-br from-slate-100 to-blue-50 border border-slate-200`}>
      {/* Fake map grid */}
      <div className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(59,130,246,0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59,130,246,0.3) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />
      {/* Fake roads */}
      <div className="absolute inset-0">
        <div className="absolute top-1/3 left-0 right-0 h-0.5 bg-white/60" />
        <div className="absolute top-2/3 left-0 right-0 h-0.5 bg-white/40" />
        <div className="absolute left-1/4 top-0 bottom-0 w-0.5 bg-white/60" />
        <div className="absolute left-3/4 top-0 bottom-0 w-0.5 bg-white/40" />
      </div>

      {/* Center pin */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
        <div className="w-12 h-12 rounded-full bg-blue-500 shadow-lg shadow-blue-300 flex items-center justify-center animate-bounce">
          <FiMap className="text-white" size={22} />
        </div>
        {name && <p className="text-sm font-semibold text-slate-700 bg-white/80 px-3 py-1 rounded-full shadow-sm">{name}</p>}
        {address && <p className="text-xs text-slate-500 bg-white/80 px-3 py-1 rounded-full">{address}</p>}
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 mt-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-md"
        >
          <FiNavigation size={14} />
          Open in Google Maps
        </a>
      </div>
    </div>
  );
}
