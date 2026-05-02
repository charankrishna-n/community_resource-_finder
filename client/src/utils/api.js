import axios from "axios";

const api = axios.create({ baseURL: "/api" });

export const fetchResources = (params = {}) => api.get("/resources", { params });
export const fetchResourceById = (id) => api.get(`/resources/${id}`);
export const fetchStats = () => api.get("/resources/stats");
export const createResource = (data) => api.post("/resources", data);
export const updateResource = (id, data) => api.put(`/resources/${id}`, data);
export const deleteResource = (id) => api.delete(`/resources/${id}`);
