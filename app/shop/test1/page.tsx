"use client"

import { useState } from "react"
import Image from "next/image"
import { PublicNavigation } from "@/components/public-navigation"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useCart } from "@/context/cart-context"
import { CartSheet } from "@/components/cart-sheet"
import { useToast } from "@/components/ui/use-toast"
import { Minus, Plus, ShoppingCart, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface Product {
  id: string
  name: string
  description: string
  price: number
  image: string
  category: string
  attributes: {
    size: string[]
    color: string[]
  }
}

const testProduct: Product = {
  id: "test1",
  name: "FK Banga Testinis Produktas",
  description: "Tai yra testinis FK Banga produktas su visomis funkcijomis. Puikus pavyzdys parduotuvės funkcionalumui demonstruoti. Produktas turi daugybę savybių ir yra puikus testavimo tikslams.",
  price: 99.99,
  image: "/Banga-1.png",
  category: "Testinis",
  attributes: {
    size: ["XS", "S", "M", "L", "XL", "XXL"],
    color: ["Mėlynas", "Baltas", "Juodas", "Oranžinis"]
  }
}

export default function TestProductPage() {
  const { toast } = useToast()
  const { cart, addToCart, updateQuantity, removeFromCart } = useCart()
  const [isCartSheetOpen, setIsCartSheetOpen] = useState(false)
  const [selectedSize, setSelectedSize] = useState(testProduct.attributes.size[0])
  const [selectedColor, setSelectedColor] = useState(testProduct.attributes.color[0])
  const [quantity, setQuantity] = useState(1)

  const getQuantityInCart = () => {
    const item = cart.find(item => item.id === testProduct.id)
    return item ? item.quantity : 0
  }

  const handleAddToCart = () => {
    if (quantity > 0) {
      addToCart({
        id: testProduct.id,
        name: `${testProduct.name} (${selectedSize}, ${selectedColor})`,
        price: testProduct.price,
        quantity: quantity,
        eventId: "shop",
        eventTitle: "Parduotuvė",
        image: testProduct.image,
        color: `${selectedSize} | ${selectedColor}`,
        category: testProduct.category,
      })
      
      toast({
        title: "Pridėta į krepšelį",
        description: "Produktas sėkmingai pridėtas į krepšelį",
      })
    }
  }

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1) {
      setQuantity(newQuantity)
    }
  }

  return (
    <div className="min-h-screen bg-[#0A165B] text-white">
      <PublicNavigation currentPage="parduotuve" />
      <CartSheet open={isCartSheetOpen} onOpenChange={setIsCartSheetOpen} />
      
      {/* Main Content */}
      <div className="w-full">
        {/* Back Button */}
        <div className="p-4 border-b border-[#232C62]">
          <Link 
            href="/shop" 
            className="inline-flex items-center text-white hover:text-[#F15601] transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Grįžti į parduotuvę
          </Link>
        </div>
        
        {/* Product Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Left Side - Product Image */}
          <div className="border-r border-[#232C62]">
            <div className="relative">
              <Image
                src={testProduct.image}
                alt={testProduct.name}
                width={600}
                height={600}
                className="w-full h-96 lg:h-[600px] object-cover"
              />
              <div className="absolute top-4 left-4 bg-[#F15601] text-white px-3 py-1 text-sm font-semibold">
                {testProduct.category}
              </div>
            </div>
          </div>

          {/* Right Side - Product Info */}
          <div className="p-6 lg:p-8">
            <div className="space-y-6">
              {/* Product Title and Price */}
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">
                  {testProduct.name}
                </h1>
                <div className="text-[#F15601] font-bold text-3xl lg:text-4xl">
                  €{testProduct.price.toFixed(2)}
                </div>
              </div>

              {/* Product Description */}
              <div>
                <p className="text-gray-300 leading-relaxed text-lg">
                  {testProduct.description}
                </p>
              </div>

              {/* Size Selection */}
              <div>
                <Label className="text-white text-lg font-semibold mb-3 block">Dydis:</Label>
                <div className="flex flex-wrap gap-2">
                  {testProduct.attributes.size.map((size) => (
                    <Button
                      key={size}
                      variant="outline"
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 text-base ${
                        selectedSize === size
                          ? "bg-[#F15601] text-white border-[#F15601]"
                          : "border-[#232C62] text-white hover:bg-white/10"
                      }`}
                    >
                      {size}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Color Selection */}
              <div>
                <Label className="text-white text-lg font-semibold mb-3 block">Spalva:</Label>
                <div className="flex flex-wrap gap-2">
                  {testProduct.attributes.color.map((color) => (
                    <Button
                      key={color}
                      variant="outline"
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 text-base ${
                        selectedColor === color
                          ? "bg-[#F15601] text-white border-[#F15601]"
                          : "border-[#232C62] text-white hover:bg-white/10"
                      }`}
                    >
                      {color}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Quantity Selection */}
              <div>
                <Label className="text-white text-lg font-semibold mb-3 block">Kiekis:</Label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                      className="w-12 h-12 p-0 border-[#232C62] text-white hover:bg-white/10 disabled:opacity-50"
                    >
                      <Minus className="w-6 h-6" />
                    </Button>
                    <span className="text-white font-bold text-2xl min-w-[3rem] text-center">
                      {quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => handleQuantityChange(quantity + 1)}
                      className="w-12 h-12 p-0 border-[#232C62] text-white hover:bg-white/10"
                    >
                      <Plus className="w-6 h-6" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Add to Cart Button */}
              <div className="pt-4">
                <Button
                  onClick={handleAddToCart}
                  className="w-full bg-[#F15601] hover:bg-[#F15601]/90 text-white font-bold py-4 text-xl"
                >
                  <ShoppingCart className="w-6 h-6 mr-3" />
                  Pridėti į krepšelį
                </Button>
              </div>

              {/* Cart Status */}
              {getQuantityInCart() > 0 && (
                <div className="text-center p-4 bg-green-900/20 border border-green-500/30">
                  <p className="text-green-400 font-semibold">
                    Krepšelyje: {getQuantityInCart()} vnt.
                  </p>
                  <Button
                    variant="ghost"
                    onClick={() => setIsCartSheetOpen(true)}
                    className="text-green-300 hover:text-green-200 mt-2"
                  >
                    Peržiūrėti krepšelį
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
