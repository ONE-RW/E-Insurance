import client from "./client";

export async function getUsers(params = {}) {
  const res = await client.get("/users", { params });
  return res.data.users;
}

export async function createUser(data) {
  const res = await client.post("/users", data);
  return res.data.user;
}

export async function updateUser(id, data) {
  const res = await client.put(`/users/${id}`, data);
  return res.data.user;
}

export async function setUserStatus(id, status) {
  const res = await client.patch(`/users/${id}/status`, { status });
  return res.data.user;
}

export async function resetUserPassword(id, password) {
  const res = await client.patch(`/users/${id}/password`, { password });
  return res.data;
}
