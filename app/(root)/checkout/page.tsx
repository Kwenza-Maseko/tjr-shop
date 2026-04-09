'use client'

import { useEffect, useState } from "react";
import CheckoutPage from "@/components/CheckoutPage";

const Checkout = () => {
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const storedCart = sessionStorage.getItem("checkout_cart");
    const storedTotal = sessionStorage.getItem("checkout_total");

    if (storedCart) {
      setCartItems(JSON.parse(storedCart));
    }

    if (storedTotal) {
      setTotal(JSON.parse(storedTotal));
    }
  }, []);

  return <CheckoutPage cartItems={cartItems} cartSubtotal={total} />;
};

export default Checkout;