import client from "./client";

export async function updateProfile({ full_name, email }) {
  const res = await client.put("/users/me", { full_name, email });
  return res.data;
}

export async function changePassword({ current_password, new_password }) {
  const res = await client.patch("/users/me/password", { current_password, new_password });
  return res.data;
}

export async function uploadAvatar(file) {
  const formData = new FormData();
  formData.append("avatar", file);
  const res = await client.post("/users/me/avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}
