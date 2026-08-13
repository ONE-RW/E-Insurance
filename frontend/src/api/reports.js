import client from "./client";

export async function getReportsDashboard(days = 30) {
  const res = await client.get("/reports", { params: { days } });
  return res.data;
}
