import api from "./axios";

// Get user's cart
export async function getCart() {
  const res = await api.get("/cart/");
  return res.data;
}

// Add product to cart
export async function addToCart(productId, quantity = 1) {
  const res = await api.post("/cart/items", {
    product_id: productId,
    quantity,
  });
  return res.data;
}

// Update cart item quantity
export async function updateCartItem(cartItemId, quantity) {
  const res = await api.put(`/cart/items/${cartItemId}`, {
    quantity,
  });
  return res.data;
}

// Remove single item from cart
export async function removeCartItem(cartItemId) {
  const res = await api.delete(`/cart/items/${cartItemId}`);
  return res.data;
}

// Clear entire cart
export async function clearCart() {
  const res = await api.delete("/cart/");
  return res.data;
}

