"use client";

import { useState } from "react";
import { InteractiveCheckout } from "@/components/ui/interactive-checkout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart } from "@/context/cart-context";
import { CreditCard } from "lucide-react";
import { PublicNavigation } from "@/components/public-navigation";

export default function CheckoutPage() {
    const { cart, clearCart } = useCart();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const [name, setName] = useState("");
    const [surname, setSurname] = useState("");
    const [email, setEmail] = useState("");
    const [couponCode, setCouponCode] = useState("");
    const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
    const [couponError, setCouponError] = useState("");

    const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discountAmount = appliedCoupon ? appliedCoupon.discount_amount : 0;
    const finalAmount = totalAmount - discountAmount;

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) {
            setCouponError("Įveskite kuponų kodą");
            return;
        }

        try {
            const response = await fetch('/api/coupons/validate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    code: couponCode.trim(),
                    orderAmount: totalAmount
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setCouponError(data.error || "Nepavyko pritaikyti kuponą");
                setAppliedCoupon(null);
                return;
            }

            setAppliedCoupon(data.coupon);
            setCouponError("");
        } catch (error) {
            setCouponError("Nepavyko pritaikyti kuponą");
            setAppliedCoupon(null);
        }
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        setCouponCode("");
        setCouponError("");
    };

    const handleCheckout = async () => {
        setIsLoading(true);
        setError(null);

        if (!name || !surname || !email) {
            setError("Prašome užpildyti visus laukus.");
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/checkout/session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    cartItems: cart, 
                    purchaserEmail: email,
                    purchaserName: `${name} ${surname}`,
                    couponId: appliedCoupon?.id
                }),
            });

            const { url, error: apiError } = await response.json();

            if (!response.ok) {
                throw new Error(apiError || "Something went wrong");
            }

            if (url) {
                clearCart();
                window.location.href = url;
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0A165B] text-white flex flex-col">
            <PublicNavigation currentPage="tickets" />
            
            {/* Main Content */}
            <div className="w-full flex flex-col flex-1">
                <div className="text-center py-8 border-b border-[#232C62]">
                    <h1 className="text-3xl md:text-4xl font-bold text-white">Apmokėjimas</h1>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 flex-1 min-h-0">
                    {/* Form Section */}
                    <div className="bg-[#0A165B] border-r border-[#232C62] p-6 h-full flex flex-col">
                        <h2 className="text-xl font-semibold mb-6 text-white">Jūsų duomenys</h2>
                        <div className="space-y-6 flex-1">
                            <div>
                                <Label htmlFor="name" className="text-white mb-2 block">Vardas</Label>
                                <Input 
                                    id="name" 
                                    value={name} 
                                    onChange={(e) => setName(e.target.value)} 
                                    placeholder="Jonas" 
                                    className="bg-[#232C62] border-[#232C62] text-white placeholder:text-gray-400 focus:border-white focus:ring-white rounded-none" 
                                />
                            </div>
                            <div>
                                <Label htmlFor="surname" className="text-white mb-2 block">Pavardė</Label>
                                <Input 
                                    id="surname" 
                                    value={surname} 
                                    onChange={(e) => setSurname(e.target.value)} 
                                    placeholder="Jonaitis" 
                                    className="bg-[#232C62] border-[#232C62] text-white placeholder:text-gray-400 focus:border-white focus:ring-white rounded-none" 
                                />
                            </div>
                            <div>
                                <Label htmlFor="email" className="text-white mb-2 block">El. paštas</Label>
                                <Input 
                                    id="email" 
                                    type="email" 
                                    value={email} 
                                    onChange={(e) => setEmail(e.target.value)} 
                                    placeholder="jonas.jonaitis@email.com" 
                                    className="bg-[#232C62] border-[#232C62] text-white placeholder:text-gray-400 focus:border-white focus:ring-white rounded-none" 
                                />
                            </div>
                        </div>
                        {/* Coupon Section */}
                        <div className="border-t border-[#232C62] pt-4 mt-6">
                            <h3 className="text-white font-semibold mb-3">Kuponų kodas</h3>
                            {!appliedCoupon ? (
                                <div className="flex gap-2">
                                    <Input 
                                        value={couponCode} 
                                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())} 
                                        placeholder="Įveskite kuponų kodą" 
                                        className="flex-1 bg-[#232C62] border-[#232C62] text-white placeholder:text-gray-400 focus:border-white focus:ring-white rounded-none" 
                                    />
                                    <Button 
                                        onClick={handleApplyCoupon}
                                        className="bg-[#F15601] hover:bg-[#F15601]/90 text-white rounded-none"
                                    >
                                        Pritaikyti
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between p-3 bg-green-900/20 border border-green-500/30 rounded">
                                    <div>
                                        <p className="text-green-400 font-semibold">{appliedCoupon.code}</p>
                                        <p className="text-green-300 text-sm">
                                            Nuolaida: {appliedCoupon.discount_type === 'percentage' 
                                                ? `${appliedCoupon.discount_value}%` 
                                                : `€${appliedCoupon.discount_value.toFixed(2)}`
                                            }
                                        </p>
                                    </div>
                                    <Button 
                                        variant="ghost" 
                                        size="sm"
                                        onClick={handleRemoveCoupon}
                                        className="text-red-400 hover:text-red-300"
                                    >
                                        Pašalinti
                                    </Button>
                                </div>
                            )}
                            {couponError && <p className="text-red-400 text-sm mt-2">{couponError}</p>}
                        </div>

                        {/* Order Summary */}
                        <div className="border-t border-[#232C62] pt-4 mt-6">
                            <div className="space-y-2">
                                <div className="flex justify-between text-gray-300">
                                    <span>Pradinė suma:</span>
                                    <span>€{totalAmount.toFixed(2)}</span>
                                </div>
                                {appliedCoupon && (
                                    <div className="flex justify-between text-green-400">
                                        <span>Nuolaida:</span>
                                        <span>-€{discountAmount.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-white font-bold text-lg border-t border-[#232C62] pt-2">
                                    <span>Galutinė suma:</span>
                                    <span>€{finalAmount.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        <Button 
                            size="lg" 
                            className="w-full gap-2 mt-6 bg-[#F15601] hover:bg-[#F15601]/90 text-white font-bold py-4 px-6 rounded-none text-lg transition-colors duration-200" 
                            onClick={handleCheckout} 
                            disabled={isLoading || cart.length === 0}
                        >
                            {isLoading ? "Vykdoma..." : <><CreditCard className="w-4 h-4" /> Apmokėti</>}
                        </Button>
                        {error && <p className="text-red-400 text-sm mt-4 text-center">{error}</p>}
                    </div>
                    
                    {/* Cart Section */}
                    <div className="bg-[#0A165B] p-6 h-full">
                        <InteractiveCheckout />
                    </div>
                </div>
            </div>
        </div>
    );
} 