"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { CheckCircle, Package, Mail, Home, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/cart-context";

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  total_amount: number;
  status: string;
  created_at: string;
}

function ShopCheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { cart, clearCart } = useCart();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const didRun = React.useRef(false);

  useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;

    const sessionId = searchParams.get("session_id");
    if (!sessionId) {
      router.replace("/");
      return;
    }

    // Fetch order from database (created by webhook)
    const fetchOrder = async (retryCount = 0) => {
      setIsLoading(true);
      try {
        // Wait a bit for webhook to process
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const response = await fetch(`/api/shop/orders?session_id=${sessionId}`);
        const data = await response.json();

        if (!response.ok) {
          if (retryCount < 3) {
            console.log(`Retrying order fetch (${retryCount + 1}/3)...`);
            setTimeout(() => fetchOrder(retryCount + 1), 2000);
            return;
          }
          throw new Error(data.error || 'Failed to fetch order');
        }

        if (data.orders && data.orders.length > 0) {
          setOrder(data.orders[0]);
        } else {
          // If no order found, create a mock order for display
          const customerName = searchParams.get("customer_name") || "Klientas";
          const customerEmail = searchParams.get("customer_email") || "";
          setOrder({
            id: "pending",
            order_number: "Processing...",
            customer_name: customerName,
            customer_email: customerEmail,
            total_amount: 0,
            status: "processing",
            created_at: new Date().toISOString()
          });
        }
        
        // Clear cart after successful order creation
        clearCart();
        
        // Clear session storage
        sessionStorage.removeItem("deliveryAddress");
        sessionStorage.removeItem("couponCode");
        sessionStorage.removeItem("couponDiscount");
        sessionStorage.removeItem("cartItems");
        
      } catch (err) {
        console.error('Error creating order:', err);
        if (retryCount < 3) {
          // Retry after 2 seconds on error
          setTimeout(() => fetchOrder(retryCount + 1), 2000);
          return;
        }
        setError("Nepavyko sukurti užsakymo. Susisiekite su palaikymu.");
      } finally {
        setIsLoading(false);
      }
    };

            fetchOrder();
  }, [searchParams, router, cart, clearCart]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('lt-LT', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0A165B]">
      <div className="max-w-md w-full mx-auto p-6">
        <div className="bg-[#0A165B]/50 border border-gray-700 rounded-lg shadow-lg p-8">
          <div className="text-center">
            <div className="text-green-500 text-6xl mb-4">✅</div>
            <h1 className="text-3xl font-bold mb-4 text-white">Mokėjimas sėkmingas!</h1>
            <p className="text-gray-300 mb-6">
              Ačiū už pirkimą. Jūsų mokėjimas buvo sėkmingas ir užsakymas buvo sukurtas.
            </p>
          </div>

          {isLoading && (
            <div className="text-center mb-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F15601] mx-auto mb-2"></div>
              <p className="text-gray-300 text-sm">Kuriamas užsakymas...</p>
            </div>
          )}

          {error && (
            <div className="mb-6 p-3 bg-red-900/20 border border-red-700 rounded">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {order && (
            <div className="space-y-4 mb-6">
              <div className="border-t border-gray-700 pt-4">
                <h2 className="font-semibold mb-4 text-white">Užsakymo informacija</h2>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Package className="h-4 w-4 text-[#F15601]" />
                    <div className="flex-1">
                      <span className="text-gray-400 text-sm">Užsakymo numeris:</span>
                      <span className="ml-2 font-medium text-white">#{order.order_number}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-[#F15601]" />
                    <div className="flex-1">
                      <span className="text-gray-400 text-sm">Klientas:</span>
                      <span className="ml-2 font-medium text-white">{order.customer_name}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <ShoppingBag className="h-4 w-4 text-[#F15601]" />
                    <div className="flex-1">
                      <span className="text-gray-400 text-sm">Suma:</span>
                      <span className="ml-2 font-medium text-white">€{order.total_amount.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-4 w-4 text-[#F15601]" />
                    <div className="flex-1">
                      <span className="text-gray-400 text-sm">Statusas:</span>
                      <span className="ml-2 font-medium text-white">Laukia apdorojimo</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-[#F15601]" />
                    <div className="flex-1">
                      <span className="text-gray-400 text-sm">Patvirtinimas:</span>
                      <span className="ml-2 font-medium text-white">Išsiųstas el. paštu</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col space-y-3">
            <Button asChild className="w-full bg-[#F15601] hover:bg-[#E04501] text-white">
              <a href="/shop">
                <ShoppingBag className="h-4 w-4 mr-2" />
                Grįžti į parduotuvę
              </a>
            </Button>
            <Button asChild variant="outline" className="w-full text-white border-gray-600 hover:bg-gray-700">
              <a href="/">
                <Home className="h-4 w-4 mr-2" />
                Grįžti į pradžią
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ShopCheckoutSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ShopCheckoutSuccessContent />
    </Suspense>
  );
}
