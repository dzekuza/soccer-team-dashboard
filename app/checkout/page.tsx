"use client";

import { useState } from "react";
import { InteractiveCheckout } from "@/components/ui/interactive-checkout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart } from "@/context/cart-context";
import { CreditCard } from "lucide-react";

export default function CheckoutPage() {
    const { cart, clearCart } = useCart();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const [name, setName] = useState("");
    const [surname, setSurname] = useState("");
    const [email, setEmail] = useState("");

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
                    purchaserName: `${name} ${surname}`
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
        <div className="min-h-screen bg-[#0A2065] text-white py-12">
            <div className="container mx-auto">
                <h1 className="text-3xl font-bold mb-8 text-center">Apmokėjimas</h1>
                <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto items-start">
                    <div>
                        <InteractiveCheckout />
                    </div>
                    <div className="bg-[#070F40] p-6 rounded-xl border border-[rgba(95,95,113,0.3)]">
                        <h2 className="text-xl font-semibold mb-4">Jūsų duomenys</h2>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="name">Vardas</Label>
                                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jonas" className="bg-transparent border-main-orange text-white" />
                            </div>
                            <div>
                                <Label htmlFor="surname">Pavardė</Label>
                                <Input id="surname" value={surname} onChange={(e) => setSurname(e.target.value)} placeholder="Jonaitis" className="bg-transparent border-main-orange text-white" />
                            </div>
                            <div>
                                <Label htmlFor="email">El. paštas</Label>
                                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jonas.jonaitis@email.com" className="bg-transparent border-main-orange text-white" />
                            </div>
                        </div>
                        <Button size="lg" className="w-full gap-2 mt-8 bg-main-orange hover:bg-main-orange/90" onClick={handleCheckout} disabled={isLoading || cart.length === 0}>
                            {isLoading ? "Vykdoma..." : <><CreditCard className="w-4 h-4" /> Apmokėti</>}
                        </Button>
                        {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
                    </div>
                </div>
            </div>
        </div>
    );
} 