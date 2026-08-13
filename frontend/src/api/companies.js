import client from "./client";

export async function getCompanies() {
  const res = await client.get("/companies");
  return res.data.companies;
}

export async function createCompany(data) {
  const res = await client.post("/companies", data);
  return res.data.company;
}

export async function updateCompany(id, data) {
  const res = await client.put(`/companies/${id}`, data);
  return res.data.company;
}

export async function setCompanyStatus(id, status) {
  const res = await client.patch(`/companies/${id}/status`, { status });
  return res.data.company;
}
