import client from "./client";

export async function getVehicles(params = {}) {
  const res = await client.get("/vehicles", { params });
  return res.data.vehicles;
}

export async function getVehicleByPlate(plate) {
  const res = await client.get(`/vehicles/by-plate/${encodeURIComponent(plate)}`);
  return res.data.vehicle;
}

export async function createVehicle(data) {
  const res = await client.post("/vehicles", data);
  return res.data.vehicle;
}

export async function updateVehicle(id, data) {
  const res = await client.put(`/vehicles/${id}`, data);
  return res.data.vehicle;
}
