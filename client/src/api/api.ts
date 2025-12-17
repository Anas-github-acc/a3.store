import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "/api";

export const getNodes = () =>
  axios.get(`${API_BASE}/cluster/nodes`).then(r => r.data);

export const getHealth = () =>
  axios.get(`${API_BASE}/cluster/health`).then(r => r.data);

export const putKey = (key: string, value: string) =>
  axios.post(`${API_BASE}/kv/put`, { key, value });

export const getKey = (key: string) =>
  axios.get(`${API_BASE}/kv/get`, { params: { key } }).then(r => r.data);

