import client from "./client";

export async function getLogs(params = {}) {
  const res = await client.get("/logs", { params });
  return res.data;
}

export async function getMyLogs(params = {}) {
  const res = await client.get("/logs/me", { params });
  return res.data;
}
