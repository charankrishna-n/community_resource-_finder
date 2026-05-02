const resources = require("../models/resources");

let store = [...resources];
let nextId = store.length + 1;

// Haversine distance in km
function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const getAll = (req, res) => {
  const { category, availability, search, maxDistance, lat, lng, radius, fallback } = req.query;
  let result = [...store];

  // Category filter
  if (category && category !== "all") {
    result = result.filter((r) => r.category === category);
  }

  // Availability filter
  if (availability && availability !== "all") {
    result = result.filter((r) => r.availability === availability);
  }

  // Keyword search
  if (search) {
    const q = search.toLowerCase();
    result = result.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.city.toLowerCase().includes(q) ||
        r.country?.toLowerCase().includes(q) ||
        r.address.toLowerCase().includes(q) ||
        r.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  // Geo-distance: if lat/lng provided, compute real distances and sort
  if (lat && lng) {
    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);
    const maxRadius = radius ? parseFloat(radius) : null;

    const withDistance = result
      .map((r) => ({
        ...r,
        distance: parseFloat(haversineKm(userLat, userLng, r.lat, r.lng).toFixed(1)),
      }))
      .sort((a, b) => a.distance - b.distance);

    const filtered = maxRadius ? withDistance.filter((r) => r.distance <= maxRadius) : withDistance;

    // If no results within radius but fallback requested, return closest 6
    result = (filtered.length === 0 && fallback === "true") ? withDistance.slice(0, 6) : filtered;
  } else if (maxDistance) {
    // Fallback: filter by static distance field
    result = result.filter((r) => r.distance <= parseFloat(maxDistance));
  }

  res.json({ success: true, count: result.length, data: result });
};

const getById = (req, res) => {
  const resource = store.find((r) => r.id === req.params.id);
  if (!resource) return res.status(404).json({ success: false, message: "Resource not found" });
  res.json({ success: true, data: resource });
};

const create = (req, res) => {
  const resource = { id: String(nextId++), ...req.body, verified: false };
  store.push(resource);
  res.status(201).json({ success: true, data: resource });
};

const update = (req, res) => {
  const idx = store.findIndex((r) => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: "Resource not found" });
  store[idx] = { ...store[idx], ...req.body };
  res.json({ success: true, data: store[idx] });
};

const remove = (req, res) => {
  const idx = store.findIndex((r) => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: "Resource not found" });
  store.splice(idx, 1);
  res.json({ success: true, message: "Deleted" });
};

const getStats = (req, res) => {
  const total = store.length;
  const verified = store.filter((r) => r.verified).length;
  const open = store.filter((r) => r.availability === "open").length;
  const byCategory = store.reduce((acc, r) => {
    acc[r.category] = (acc[r.category] || 0) + 1;
    return acc;
  }, {});
  res.json({ success: true, data: { total, verified, open, activeUsers: 1284, byCategory } });
};

module.exports = { getAll, getById, create, update, remove, getStats };
