"use client";

import { useState } from "react";
import { InteractiveCheckout } from "@/components/ui/interactive-checkout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
    const [phone, setPhone] = useState("");
    const [streetAddress, setStreetAddress] = useState("");
    const [city, setCity] = useState("");
    const [postalCode, setPostalCode] = useState("");
    const [country, setCountry] = useState("LT");
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

        if (!name || !surname || !email || !phone || !streetAddress || !city || !postalCode || !country) {
            setError("Prašome užpildyti visus laukus.");
            setIsLoading(false);
            return;
        }

        // Store delivery address and coupon info in session storage
        const deliveryAddress = {
            street: streetAddress,
            city: city,
            postalCode: postalCode,
            country: country
        };
        
        sessionStorage.setItem("deliveryAddress", JSON.stringify(deliveryAddress));
        sessionStorage.setItem("couponCode", appliedCoupon?.code || "");
        sessionStorage.setItem("couponDiscount", discountAmount.toString());
        sessionStorage.setItem("cartItems", JSON.stringify(cart));

        try {
            // Determine the checkout type based on cart contents
            const hasShopItems = cart.some(item => item.eventId === "shop");
            const hasTicketItems = cart.some(item => item.eventId && item.eventId !== "shop");
            
            let apiEndpoint = '/api/checkout/session'; // Use session for tickets-only or mixed

            if (hasShopItems && !hasTicketItems) {
                // Pure shop purchase still uses dedicated shop endpoint
                apiEndpoint = '/api/checkout/shop';
            }
            
            const response = await fetch(apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    cartItems: cart, 
                    purchaserEmail: email,
                    purchaserName: `${name} ${surname}`,
                    purchaserPhone: phone,
                    deliveryAddress: deliveryAddress,
                    couponId: appliedCoupon?.id
                }),
            });

            const { url, error: apiError } = await response.json();

            if (!response.ok) {
                throw new Error(apiError || "Something went wrong");
            }

            if (url) {
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
                            {/* Personal Information */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium text-white border-b border-[#232C62] pb-2">Asmeninė informacija</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="name" className="text-white mb-2 block">Vardas *</Label>
                                        <Input 
                                            id="name" 
                                            value={name} 
                                            onChange={(e) => setName(e.target.value)} 
                                            placeholder="Jonas" 
                                            className="bg-[#232C62] border-[#232C62] text-white placeholder:text-gray-400 focus:border-white focus:ring-white rounded-none" 
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="surname" className="text-white mb-2 block">Pavardė *</Label>
                                        <Input 
                                            id="surname" 
                                            value={surname} 
                                            onChange={(e) => setSurname(e.target.value)} 
                                            placeholder="Jonaitis" 
                                            className="bg-[#232C62] border-[#232C62] text-white placeholder:text-gray-400 focus:border-white focus:ring-white rounded-none" 
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="email" className="text-white mb-2 block">El. paštas *</Label>
                                    <Input 
                                        id="email" 
                                        type="email" 
                                        value={email} 
                                        onChange={(e) => setEmail(e.target.value)} 
                                        placeholder="jonas.jonaitis@email.com" 
                                        className="bg-[#232C62] border-[#232C62] text-white placeholder:text-gray-400 focus:border-white focus:ring-white rounded-none" 
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="phone" className="text-white mb-2 block">Telefono numeris *</Label>
                                    <Input 
                                        id="phone" 
                                        type="tel" 
                                        value={phone} 
                                        onChange={(e) => setPhone(e.target.value)} 
                                        placeholder="+370 600 00000" 
                                        className="bg-[#232C62] border-[#232C62] text-white placeholder:text-gray-400 focus:border-white focus:ring-white rounded-none" 
                                    />
                                </div>
                            </div>

                            {/* Delivery Address */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium text-white border-b border-[#232C62] pb-2">Pristatymo adresas</h3>
                                <div>
                                    <Label htmlFor="streetAddress" className="text-white mb-2 block">Gatvės adresas *</Label>
                                    <Input 
                                        id="streetAddress" 
                                        value={streetAddress} 
                                        onChange={(e) => setStreetAddress(e.target.value)} 
                                        placeholder="Gedimino pr. 1" 
                                        className="bg-[#232C62] border-[#232C62] text-white placeholder:text-gray-400 focus:border-white focus:ring-white rounded-none" 
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="city" className="text-white mb-2 block">Miestas *</Label>
                                        <Input 
                                            id="city" 
                                            value={city} 
                                            onChange={(e) => setCity(e.target.value)} 
                                            placeholder="Vilnius" 
                                            className="bg-[#232C62] border-[#232C62] text-white placeholder:text-gray-400 focus:border-white focus:ring-white rounded-none" 
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="postalCode" className="text-white mb-2 block">Pašto kodas *</Label>
                                        <Input 
                                            id="postalCode" 
                                            value={postalCode} 
                                            onChange={(e) => setPostalCode(e.target.value)} 
                                            placeholder="01108" 
                                            className="bg-[#232C62] border-[#232C62] text-white placeholder:text-gray-400 focus:border-white focus:ring-white rounded-none" 
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="country" className="text-white mb-2 block">Šalis *</Label>
                                    <Select value={country} onValueChange={setCountry}>
                                        <SelectTrigger className="bg-[#232C62] border-[#232C62] text-white focus:border-white focus:ring-white rounded-none">
                                            <SelectValue placeholder="Pasirinkite šalį" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-[#232C62] border-[#232C62] text-white">
                                            <SelectItem value="LT">Lietuva</SelectItem>
                                            <SelectItem value="LV">Latvija</SelectItem>
                                            <SelectItem value="EE">Estija</SelectItem>
                                            <SelectItem value="PL">Lenkija</SelectItem>
                                            <SelectItem value="DE">Vokietija</SelectItem>
                                            <SelectItem value="SE">Švedija</SelectItem>
                                            <SelectItem value="FI">Suomija</SelectItem>
                                            <SelectItem value="DK">Danija</SelectItem>
                                            <SelectItem value="NO">Norvegija</SelectItem>
                                            <SelectItem value="GB">Jungtinė Karalystė</SelectItem>
                                            <SelectItem value="US">Jungtinės Valstijos</SelectItem>
                                            <SelectItem value="CA">Kanada</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Cart Section */}
                    <div className="bg-[#0A165B] p-6 h-full flex flex-col">
                        <InteractiveCheckout />
                        
                        {/* Coupon Section */}
                        {cart.length > 0 && (
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
                        )}

                        {/* Order Summary */}
                        {cart.length > 0 && (
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
                        )}

                        {/* Checkout Button */}
                        {cart.length > 0 && (
                            <Button 
                                size="lg" 
                                className="w-full gap-2 mt-6 bg-[#F15601] hover:bg-[#F15601]/90 text-white font-bold py-4 px-6 rounded-none text-lg transition-colors duration-200" 
                                onClick={handleCheckout} 
                                disabled={isLoading}
                            >
                                {isLoading ? "Vykdoma..." : <><CreditCard className="w-4 h-4" /> Apmokėti</>}
                            </Button>
                        )}
                        {error && <p className="text-red-400 text-sm mt-4 text-center">{error}</p>}
                    </div>
                </div>
            </div>
        </div>
    );
} 