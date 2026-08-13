import client from "./client";

export async function getPolicies(params = {}) {
  const res = await client.get("/policies", { params });
  return res.data.policies;
}

export async function createPolicy(data) {
  const res = await client.post("/policies", data);
  return res.data.policy;
}

export async function updatePolicy(id, data) {
  const res = await client.put(`/policies/${id}`, data);
  return res.data.policy;
}

export async function cancelPolicy(id) {
  const res = await client.patch(`/policies/${id}/cancel`);
  return res.data.policy;
}
