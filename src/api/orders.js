import api from "./axios";

// --- Customer Order APIs ---

// Create order from user's current cart with delivery address
export async function createOrder(addressId) {
  const res = await api.post("/orders/", {
    address_id: addressId,
  });
  return res.data;
}

// Get all orders placed by the current user
export async function getOrders() {
  const res = await api.get("/orders/");
  return res.data;
}

// Get single order details with item breakdown
export async function getOrderDetails(orderId) {
  const res = await api.get(`/orders/${orderId}`);
  return res.data;
}

// Cancel an active order (PENDING or CONFIRMED)
export async function cancelOrder(orderId) {
  const res = await api.patch(`/orders/${orderId}/cancel`);
  return res.data;
}

// --- Admin Order APIs ---

// View all customer orders across the platform
export async function getAllAdminOrders() {
  const res = await api.get("/admin/orders/");
  return res.data;
}

// View full customer order details with line items and delivery address
export async function getAdminOrderDetails(orderId) {
  const res = await api.get(`/admin/orders/${orderId}`);
  return res.data;
}

// Update order status in the fulfillment pipeline
export async function updateOrderStatus(orderId, status) {
  const res = await api.patch(`/admin/orders/${orderId}/status`, {
    status,
  });
  return res.data;
}
