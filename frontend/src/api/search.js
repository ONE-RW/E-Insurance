import client from "./client";

export async function searchByPlate(plate) {
  const res = await client.get("/search", { params: { plate } });
  return res.data;
}

export async function searchByTin(tin) {
  const res = await client.get("/search", { params: { tin } });
  return res.data;
}
