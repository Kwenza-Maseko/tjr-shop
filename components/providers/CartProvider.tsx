// providers/CartProvider.tsx
'use client'

import { createContext, useContext, useEffect, useState } from 'react'

interface CartContextType {
  cartCount: number
  setCartCount: (n: number) => void
  incrementCart: () => void
  decrementCart: (by?: number) => void
}

const CartContext = createContext<CartContextType>({
  cartCount: 0,
  setCartCount: () => {},
  incrementCart: () => {},
  decrementCart: () => {},
})

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cartCount, setCartCount] = useState(0)

  // One DB read on mount to get the real count
  useEffect(() => {
    fetch('/api/cart/count')
      .then(r => r.json())
      .then(data => setCartCount(data.count ?? 0))
      .catch(() => {})
  }, [])

  const incrementCart = () => setCartCount(p => p + 1)
  const decrementCart = (by = 1) => setCartCount(p => Math.max(0, p - by))

  return (
    <CartContext.Provider value={{ cartCount, setCartCount, incrementCart, decrementCart }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)