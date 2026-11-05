import api from "./axios";

// Get all user addresses
export async function getAddresses() {
  const res = await api.get("/addresses/");
  return res.data;
}

// Get single address
export async function getAddress(id) {
  const res = await api.get(`/addresses/${id}`);
  return res.data;
}

// Create new delivery address
export async function createAddress(addressData) {
  const res = await api.post("/addresses/", addressData);
  return res.data;
}

// Update address
export async function updateAddress(id, addressData) {
  const res = await api.put(`/addresses/${id}`, addressData);
  return res.data;
}

// Delete address
export async function deleteAddress(id) {
  const res = await api.delete(`/addresses/${id}`);
  return res.data;
}

