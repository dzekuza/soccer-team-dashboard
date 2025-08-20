"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Temporarily define CartItem here until the component is created
export interface CartItem {
    id: string;
    name: string;
    price: number;
    category: string;
    image: string;
    color: string;
    quantity: number;
    eventId?: string;
    eventTitle?: string;
}

interface CartContextType {
  cart: CartItem[];
  isInitialized: boolean;
  addToCart: (item: CartItem) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, delta: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load cart from session storage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedCart = sessionStorage.getItem('cart');
        if (savedCart) {
          const parsedCart = JSON.parse(savedCart);
          setCart(parsedCart);
        }
      } catch (error) {
        console.error('Error loading cart from session storage:', error);
      }
      setIsInitialized(true);
    }
  }, []);

  // Save cart to session storage whenever it changes
  useEffect(() => {
    if (isInitialized && typeof window !== 'undefined') {
      try {
        sessionStorage.setItem('cart', JSON.stringify(cart));
      } catch (error) {
        console.error('Error saving cart to session storage:', error);
      }
    }
  }, [cart, isInitialized]);

  const addToCart = (productToAdd: CartItem) => {
    setCart((currentCart) => {
      const existingItem = currentCart.find((item) => item.id === productToAdd.id);
      if (existingItem) {
        return currentCart.map((item) =>
          item.id === productToAdd.id
            ? { ...item, quantity: item.quantity + productToAdd.quantity }
            : item
        );
      }
      return [...currentCart, productToAdd];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((currentCart) => currentCart.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((currentCart) =>
      currentCart
        .map((item) => {
          if (item.id === productId) {
            const newQuantity = item.quantity + delta;
            return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null)
    );
  };
  
  const clearCart = () => {
    setCart([]);
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.removeItem('cart');
      } catch (error) {
        console.error('Error clearing cart from session storage:', error);
      }
    }
  };

  return (
    <CartContext.Provider value={{ cart, isInitialized, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}; 