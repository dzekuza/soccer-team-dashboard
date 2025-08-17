"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus, ShoppingCart, X } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
// @ts-ignore
import NumberFlow from "@number-flow/react";
import { useCart } from "@/context/cart-context";
import type { CartItem } from "@/context/cart-context";

interface InteractiveCheckoutProps {}

function InteractiveCheckout({}: InteractiveCheckoutProps) {
    const { cart, removeFromCart, updateQuantity } = useCart();

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className={cn(
                "w-full flex flex-col h-full"
            )}
        >
            <div className="flex items-center gap-2 mb-4">
                <ShoppingCart className="w-5 h-5 text-gray-400" />
                <h2 className="text-lg font-semibold text-white">
                    Krepšelis ({totalItems})
                </h2>
            </div>

            <motion.div
                className={cn(
                    "flex-1 overflow-y-auto",
                    "min-h-0",
                    "space-y-4"
                )}
            >
                <AnimatePresence initial={false} mode="popLayout">
                    {cart.map((item) => (
                        <motion.div
                            key={item.id}
                            layout
                            initial={{ opacity: 0, scale: 0.96 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.96 }}
                            transition={{
                                opacity: { duration: 0.2 },
                                layout: { duration: 0.2 },
                            }}
                            className={cn(
                                "flex items-center gap-4",
                                "p-4",
                                "bg-[#0A165B]",
                                "border-b border-[#232C62]"
                            )}
                        >
                            <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-black/10">
                                <Image
                                    src={item.image}
                                    alt={item.name}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-base font-medium text-white truncate">
                                        {item.name}
                                    </span>
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() =>
                                            removeFromCart(item.id)
                                        }
                                        className="p-2 hover:bg-white/10 transition-colors"
                                    >
                                        <X className="w-4 h-4 text-gray-400" />
                                    </motion.button>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() =>
                                                updateQuantity(
                                                    item.id,
                                                    -1
                                                )
                                            }
                                            className="p-2 hover:bg-white/10 transition-colors"
                                        >
                                            <Minus className="w-4 h-4 text-white" />
                                        </motion.button>
                                        <motion.span
                                            layout
                                            className="text-base text-white font-medium w-8 text-center"
                                        >
                                            {item.quantity}
                                        </motion.span>
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() =>
                                                updateQuantity(
                                                    item.id,
                                                    1
                                                )
                                            }
                                            className="p-2 hover:bg-white/10 transition-colors"
                                        >
                                            <Plus className="w-4 h-4 text-white" />
                                        </motion.button>
                                    </div>
                                    <motion.span
                                        layout
                                        className="text-lg font-bold text-white"
                                    >
                                        €
                                        {(
                                            item.price * item.quantity
                                        ).toFixed(2)}
                                    </motion.span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
                {cart.length === 0 && (
                    <div className="text-center py-12 text-gray-400">
                        <ShoppingCart className="w-12 h-12 mx-auto mb-4" />
                        <p className="text-lg">Jūsų krepšelis tuščias.</p>
                    </div>
                )}
            </motion.div>
            
            {cart.length > 0 && (
                <motion.div
                    layout
                    className={cn(
                        "mt-auto pt-4",
                        "border-t border-[#232C62]"
                    )}
                >
                    <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold text-white">
                            Iš viso
                        </span>
                        <motion.span
                            layout
                            className="text-2xl font-bold text-white"
                        >
                            €<NumberFlow value={totalPrice} />
                        </motion.span>
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
}

export { InteractiveCheckout }; 