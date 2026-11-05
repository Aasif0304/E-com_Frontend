import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";
import * as cartApi from "../api/cart";

const CartContext = createContext(null);
export const useCart = () => useContext(CartContext);

export function CartProvider({ children }) {
  const { token } = useAuth();
  const [cart, setCart] = useState({
    items: [],
    total_items: 0,
    total_amount: 0,
  });
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!token) {
      setCart({ items: [], total_items: 0, total_amount: 0 });
      return;
    }
    setLoading(true);
    try {
      const data = await cartApi.getCart();
      setCart(data);
    } catch (err) {
      // If 404 or empty cart, set clean empty state
      setCart({ items: [], total_items: 0, total_amount: 0 });
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  async function addItem(productId, quantity = 1) {
    if (!token) throw new Error("Please log in to add items to your cart.");
    await cartApi.addToCart(productId, quantity);
    await fetchCart();
  }

  async function updateQty(cartItemId, quantity) {
    if (quantity <= 0) {
      return removeItem(cartItemId);
    }
    await cartApi.updateCartItem(cartItemId, quantity);
    await fetchCart();
  }

  async function removeItem(cartItemId) {
    await cartApi.removeCartItem(cartItemId);
    await fetchCart();
  }

  async function clearAll() {
    await cartApi.clearCart();
    await fetchCart();
  }

  const itemCount = cart.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        itemCount,
        loading,
        fetchCart,
        addItem,
        updateQty,
        removeItem,
        clearAll,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

