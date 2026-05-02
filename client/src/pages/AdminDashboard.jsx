import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiPlus, FiEdit2, FiTrash2, FiCheckCircle, FiXCircle,
  FiUsers, FiDatabase, FiActivity, FiShield, FiSearch, FiX
} from "react-icons/fi";
import { fetchResources, fetchStats, createResource, updateResource, deleteResource } from "../utils/api";

const EMPTY_FORM = {
  name: "", category: "shelter", description: "", address: "", city: "",
  phone: "", email: "", website: "", hours: "", availability: "open",
  capacity: "", currentOccupancy: "0", distance: "1.0", verified: false,
  tags: "",
};

export default function AdminDashboard() {
  const [resources, setResources] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [rRes, sRes] = await Promise.all([fetchResources(), fetchStats()]);
      setResources(rRes.data.data);
      setStats(sRes.data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditTarget(null); setForm(EMPTY_FORM); setModalOpen(true); };
  const openEdit = (r) => {
    setEditTarget(r);
    setForm({ ...r, tags: r.tags?.join(", ") || "", capacity: String(r.capacity || ""), currentOccupancy: String(r.currentOccupancy || "0") });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        capacity: Number(form.capacity) || 0,
        currentOccupancy: Number(form.currentOccupancy) || 0,
        distance: Number(form.distance) || 1,
      };
      if (editTarget) {
        await updateResource(editTarget.id, payload);
      } else {
        await createResource(payload);
      }
      setModalOpen(false);
      load();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    await deleteResource(id);
    setDeleteConfirm(null);
    load();
  };

  const toggleVerified = async (r) => {
    await updateResource(r.id, { verified: !r.verified });
    load();
  };

  const filtered = resources.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.category.toLowerCase().includes(search.toLowerCase())
  );

  const STAT_CARDS = stats ? [
    { icon: FiDatabase, label: "Total Resources", value: stats.total, color: "from-blue-500 to-blue-700" },
    { icon: FiCheckCircle, label: "Verified", value: stats.verified, color: "from-emerald-500 to-emerald-700" },
    { icon: FiActivity, label: "Open Now", value: stats.open, color: "from-purple-500 to-purple-700" },
    { icon: FiUsers, label: "Active Users", value: stats.activeUsers?.toLocaleString(), color: "from-orange-500 to-orange-700" },
  ] : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Admin Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Manage community resources</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium text-sm hover:shadow-lg hover:shadow-blue-200 transition-all"
        >
          <FiPlus size={16} /> Add Resource
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {loading
          ? [...Array(4)].map((_, i) => <div key={i} className="h-28 bg-slate-200 rounded-2xl animate-pulse" />)
          : STAT_CARDS.map((card, i) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${card.color} text-white p-5`}
                >
                  <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/10 rounded-full" />
                  <Icon size={22} className="mb-3 opacity-90" />
                  <p className="text-2xl font-bold">{card.value}</p>
                  <p className="text-xs text-white/70 mt-1">{card.label}</p>
                </motion.div>
              );
            })}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center gap-3">
          <div className="flex-1 flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
            <FiSearch className="text-slate-400" size={15} />
            <input
              type="text"
              placeholder="Search resources..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm text-slate-700 placeholder-slate-400"
            />
          </div>
          <span className="text-sm text-slate-400">{filtered.length} items</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                {["Name", "Category", "Availability", "Distance", "Verified", "Actions"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? [...Array(5)].map((_, i) => (
                    <tr key={i} className="border-b border-slate-50">
                      {[...Array(6)].map((_, j) => (
                        <td key={j} className="px-5 py-4">
                          <div className="h-4 bg-slate-100 rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                : filtered.map((r) => (
                    <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-4">
                        <p className="font-medium text-slate-800">{r.name}</p>
                        <p className="text-xs text-slate-400 truncate max-w-[180px]">{r.address}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className="capitalize px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                          {r.category}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`capitalize px-2.5 py-1 rounded-full text-xs font-medium ${
                          r.availability === "open" ? "bg-emerald-100 text-emerald-700" :
                          r.availability === "limited" ? "bg-amber-100 text-amber-700" :
                          "bg-red-100 text-red-600"
                        }`}>
                          {r.availability}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-500">{r.distance} km</td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => toggleVerified(r)}
                          title="Toggle verified"
                          className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full transition-all ${
                            r.verified ? "bg-blue-50 text-blue-600 hover:bg-blue-100" : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                          }`}
                        >
                          {r.verified ? <FiCheckCircle size={12} /> : <FiXCircle size={12} />}
                          {r.verified ? "Verified" : "Unverified"}
                        </button>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEdit(r)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                          >
                            <FiEdit2 size={14} />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(r)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
                          >
                            <FiTrash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-100">
                <h2 className="font-semibold text-slate-800 text-lg">
                  {editTarget ? "Edit Resource" : "Add New Resource"}
                </h2>
                <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                  <FiX size={20} />
                </button>
              </div>
              <form onSubmit={handleSave} className="p-6 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { key: "name", label: "Name", required: true },
                    { key: "address", label: "Address", required: true },
                    { key: "city", label: "City", required: true },
                    { key: "phone", label: "Phone" },
                    { key: "email", label: "Email", type: "email" },
                    { key: "website", label: "Website" },
                    { key: "hours", label: "Hours" },
                    { key: "distance", label: "Distance (km)", type: "number" },
                    { key: "capacity", label: "Capacity", type: "number" },
                    { key: "currentOccupancy", label: "Current Occupancy", type: "number" },
                  ].map(({ key, label, required, type = "text" }) => (
                    <div key={key}>
                      <label className="block text-xs font-medium text-slate-500 mb-1">{label}</label>
                      <input
                        type={type}
                        required={required}
                        value={form[key]}
                        onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-400 transition-colors"
                      />
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-400 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={form.tags}
                    onChange={(e) => setForm((p) => ({ ...p, tags: e.target.value }))}
                    placeholder="e.g. meals, walk-in, families"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-400"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Category</label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-400"
                    >
                      {["shelter", "food", "clinic", "emergency"].map((c) => (
                        <option key={c} value={c} className="capitalize">{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Availability</label>
                    <select
                      value={form.availability}
                      onChange={(e) => setForm((p) => ({ ...p, availability: e.target.value }))}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-400"
                    >
                      {["open", "limited", "closed"].map((a) => (
                        <option key={a} value={a} className="capitalize">{a}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.verified}
                    onChange={(e) => setForm((p) => ({ ...p, verified: e.target.checked }))}
                    className="w-4 h-4 rounded accent-blue-600"
                  />
                  <span className="text-sm text-slate-600">Mark as Verified</span>
                </label>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium hover:shadow-lg transition-all disabled:opacity-60"
                  >
                    {saving ? "Saving..." : editTarget ? "Save Changes" : "Add Resource"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirm Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-sm text-center"
            >
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiTrash2 className="text-red-500" size={24} />
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">Delete Resource?</h3>
              <p className="text-slate-500 text-sm mb-6">
                Are you sure you want to delete <strong>{deleteConfirm.name}</strong>? This cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm.id)}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
