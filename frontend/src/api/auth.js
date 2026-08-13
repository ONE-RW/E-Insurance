import client from "./client";

export async function login(email, password) {
  const res = await client.post("/auth/login", { email, password });
  return res.data;
}

export async function logout() {
  const res = await client.post("/auth/logout");
  return res.data;
}

export async function getMe() {
  const res = await client.get("/auth/me");
  return res.data;
}
