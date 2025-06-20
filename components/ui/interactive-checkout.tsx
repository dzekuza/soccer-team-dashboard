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
                "w-full flex flex-col",
                "p-4 rounded-xl",
                "bg-[#070F40]",
                "border border-[rgba(95,95,113,0.3)]",
            )}
        >
            <div className="flex items-center gap-2 mb-3">
                <ShoppingCart className="w-4 h-4 text-gray-400" />
                <h2 className="text-sm font-medium text-white">
                    Krepšelis ({totalItems})
                </h2>
            </div>

            <motion.div
                className={cn(
                    "flex-1 overflow-y-auto",
                    "min-h-0",
                    "-mx-4 px-4",
                    "space-y-3"
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
                                "flex items-center gap-3",
                                "p-2 rounded-lg",
                                "bg-black/20",
                                "mb-3"
                            )}
                        >
                            <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-black/10">
                                <Image
                                    src={item.image}
                                    alt={item.name}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-white truncate">
                                        {item.name}
                                    </span>
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() =>
                                            removeFromCart(item.id)
                                        }
                                        className="p-1 rounded-md hover:bg-white/10"
                                    >
                                        <X className="w-3 h-3 text-gray-400" />
                                    </motion.button>
                                </div>
                                <div className="flex items-center justify-between mt-1">
                                    <div className="flex items-center gap-1">
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() =>
                                                updateQuantity(
                                                    item.id,
                                                    -1
                                                )
                                            }
                                            className="p-1 rounded-md hover:bg-white/10"
                                        >
                                            <Minus className="w-3 h-3 text-white" />
                                        </motion.button>
                                        <motion.span
                                            layout
                                            className="text-xs text-gray-300 w-4 text-center"
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
                                            className="p-1 rounded-md hover:bg-white/10"
                                        >
                                            <Plus className="w-3 h-3 text-white" />
                                        </motion.button>
                                    </div>
                                    <motion.span
                                        layout
                                        className="text-xs text-gray-400"
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
                    <div className="text-center py-10 text-gray-400">
                        <ShoppingCart className="w-8 h-8 mx-auto mb-2" />
                        Jūsų krepšelis tuščias.
                    </div>
                )}
            </motion.div>
            {cart.length > 0 &&
                <motion.div
                    layout
                    className={cn(
                        "pt-3 mt-3",
                        "border-t border-[rgba(95,95,113,0.3)]",
                        "bg-[#070F40]"
                    )}
                >
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-white">
                            Iš viso
                        </span>
                        <motion.span
                            layout
                            className="text-sm font-semibold text-white"
                        >
                            <NumberFlow value={totalPrice} />
                        </motion.span>
                    </div>
                </motion.div>
            }
        </motion.div>
    );
}

export { InteractiveCheckout }; 