import client from "./client";

export async function getMySessions() {
  const res = await client.get("/sessions/me");
  return res.data.sessions;
}

export async function revokeSession(id) {
  const res = await client.delete(`/sessions/me/${id}`);
  return res.data;
}
