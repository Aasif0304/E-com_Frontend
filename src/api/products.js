import api from "./axios";

// Get all products
export async function getProducts() {
  const res = await api.get("/products/");
  return res.data;
}

// Get single product by ID
export async function getProduct(id) {
  const res = await api.get(`/products/${id}`);
  return res.data;
}

// Get all categories
export async function getCategories() {
  const res = await api.get("/categories/");
  return res.data;
}

// Create new product (multipart form data)
export async function createProduct(formData) {
  const res = await api.post("/products/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

// Update existing product
export async function updateProduct(id, formData) {
  const res = await api.put(`/products/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

// Quick Restock: Update stock count directly
export async function updateProductStock(id, newStock) {
  const formData = new FormData();
  formData.append("stock", parseInt(newStock, 10));
  const res = await api.put(`/products/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

// Delete product
export async function deleteProduct(id) {
  const res = await api.delete(`/products/${id}`);
  return res.data;
}
