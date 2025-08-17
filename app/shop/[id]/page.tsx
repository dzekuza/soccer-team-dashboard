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
import { useParams } from "next/navigation"

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

const products: Product[] = [
  {
    id: "kit-home-2024",
    name: "FK Banga Namų Komplektas 2024",
    description: "Oficialus FK Banga namų komplektas 2024 sezonui. Kokybiškas, patogus ir stilingu. Šis komplektas yra sukurtas iš aukščiausios kokybės medžiagų, užtikrinančių patogumą ir funkcionalumą. Puikus tiek žaidimui, tiek kasdieniam dėvėjimui.",
    price: 89.99,
    image: "/Banga-1.png",
    category: "Komplektai",
    attributes: {
      size: ["XS", "S", "M", "L", "XL", "XXL"],
      color: ["Mėlynas", "Baltas"]
    }
  },
  {
    id: "kit-away-2024",
    name: "FK Banga Išvykos Komplektas 2024",
    description: "Oficialus FK Banga išvykos komplektas 2024 sezonui. Elegantiškas ir funkcionalus. Šis komplektas puikiai tinka tiek rungtynėms, tiek kasdieniam dėvėjimui. Kokybiškos medžiagos ir modernus dizainas.",
    price: 89.99,
    image: "/Banga-1.png",
    category: "Komplektai",
    attributes: {
      size: ["XS", "S", "M", "L", "XL", "XXL"],
      color: ["Baltas", "Juodas"]
    }
  },
  {
    id: "scarf-official",
    name: "Oficialus FK Banga Šalikas",
    description: "Oficialus FK Banga šalikas su klubo logotipu. Puikus dovana gerbėjams. Šiltas ir patogus šalikas, puikiai tinkantis tiek žiemos sezonui, tiek kaip stilingu papildymas prie bet kokio drabužių komplekto.",
    price: 24.99,
    image: "/Banga-1.png",
    category: "Atributika",
    attributes: {
      size: ["Standartinis"],
      color: ["Mėlynas", "Baltas", "Oranžinis"]
    }
  },
  {
    id: "cap-official",
    name: "Oficialus FK Banga Kepurė",
    description: "Oficialus FK Banga kepurė su klubo logotipu. Stilingu ir patogus. Puikus aksesuaras tiek vasaros, tiek žiemos sezonui. Kokybiškos medžiagos ir patvarus dizainas.",
    price: 19.99,
    image: "/Banga-1.png",
    category: "Atributika",
    attributes: {
      size: ["S", "M", "L", "XL"],
      color: ["Mėlynas", "Juodas"]
    }
  },
  {
    id: "hoodie-official",
    name: "FK Banga Oficialus Džemperis",
    description: "Oficialus FK Banga džemperis su klubo logotipu. Šiltas ir patogus. Puikus pasirinkimas šaltam sezonui. Kokybiškos medžiagos ir modernus dizainas.",
    price: 49.99,
    image: "/Banga-1.png",
    category: "Atributika",
    attributes: {
      size: ["S", "M", "L", "XL", "XXL"],
      color: ["Mėlynas", "Juodas", "Pilkas"]
    }
  },
  {
    id: "t-shirt-official",
    name: "FK Banga Oficialus Marškinėliai",
    description: "Oficialus FK Banga marškinėliai su klubo logotipu. Lengvas ir patogus. Puikus pasirinkimas vasaros sezonui. Kokybiškos medžiagos ir patvarus spausdinimas.",
    price: 29.99,
    image: "/Banga-1.png",
    category: "Atributika",
    attributes: {
      size: ["XS", "S", "M", "L", "XL", "XXL"],
      color: ["Baltas", "Mėlynas", "Juodas"]
    }
  }
]

export default function ProductPage() {
  const params = useParams()
  const productId = params.id as string
  
  const product = products.find(p => p.id === productId)
  
  const { toast } = useToast()
  const { cart, addToCart } = useCart()
  const [isCartSheetOpen, setIsCartSheetOpen] = useState(false)
  const [selectedSize, setSelectedSize] = useState(product?.attributes.size[0] || "")
  const [selectedColor, setSelectedColor] = useState(product?.attributes.color[0] || "")
  const [quantity, setQuantity] = useState(1)

  const getQuantityInCart = () => {
    const item = cart.find(item => item.id === productId)
    return item ? item.quantity : 0
  }

  const handleAddToCart = () => {
    if (!product) return
    
    if (quantity > 0) {
      addToCart({
        id: product.id,
        name: `${product.name} (${selectedSize}, ${selectedColor})`,
        price: product.price,
        quantity: quantity,
        eventId: "shop",
        eventTitle: "Parduotuvė",
        image: product.image,
        color: `${selectedSize} | ${selectedColor}`,
        category: product.category,
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

  if (!product) {
    return (
      <div className="min-h-screen bg-[#0A165B] text-white">
        <PublicNavigation currentPage="parduotuve" />
        <div className="w-full">
          <div className="p-4 border-b border-[#232C62]">
            <Link 
              href="/shop" 
              className="inline-flex items-center text-white hover:text-[#F15601] transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Grįžti į parduotuvę
            </Link>
          </div>
          <div className="text-center py-16">
            <p className="text-white text-xl">Produktas nerastas</p>
          </div>
        </div>
      </div>
    )
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
                src={product.image}
                alt={product.name}
                width={600}
                height={600}
                className="w-full h-96 lg:h-[600px] object-cover"
              />
              <div className="absolute top-4 left-4 bg-[#F15601] text-white px-3 py-1 text-sm font-semibold">
                {product.category}
              </div>
            </div>
          </div>

          {/* Right Side - Product Info */}
          <div className="p-6 lg:p-8">
            <div className="space-y-6">
              {/* Product Title and Price */}
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">
                  {product.name}
                </h1>
                <div className="text-[#F15601] font-bold text-3xl lg:text-4xl">
                  €{product.price.toFixed(2)}
                </div>
              </div>

              {/* Product Description */}
              <div>
                <p className="text-gray-300 leading-relaxed text-lg">
                  {product.description}
                </p>
              </div>

              {/* Size Selection */}
              <div>
                <Label className="text-white text-lg font-semibold mb-3 block">Dydis:</Label>
                <div className="flex flex-wrap gap-2">
                  {product.attributes.size.map((size) => (
                    <Button
                      key={size}
                      variant="outline"
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 text-base rounded-none ${
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
                  {product.attributes.color.map((color) => (
                    <Button
                      key={color}
                      variant="outline"
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 text-base rounded-none ${
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
                      className="w-12 h-12 p-0 border-[#232C62] text-white hover:bg-white/10 disabled:opacity-50 rounded-none"
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
                      className="w-12 h-12 p-0 border-[#232C62] text-white hover:bg-white/10 rounded-none"
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
                  className="w-full bg-[#F15601] hover:bg-[#F15601]/90 text-white font-bold py-4 text-xl rounded-none"
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

         {/* You Might Also Like Section */}
         <div className="border-t border-[#232C62]">
           <div className="p-6 lg:p-8">
             <h2 className="text-2xl lg:text-3xl font-bold text-white mb-6">
               Jums taip pat gali patikt
             </h2>
             
             {/* Related Products Grid */}
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
               {products
                 .filter(p => p.id !== productId)
                 .slice(0, 4)
                 .map((relatedProduct) => (
                   <Link 
                     key={relatedProduct.id} 
                     href={`/shop/${relatedProduct.id}`}
                     className="block border border-[#232C62] hover:border-white transition-colors"
                   >
                     {/* Product Image */}
                     <div className="relative">
                       <Image
                         src={relatedProduct.image}
                         alt={relatedProduct.name}
                         width={400}
                         height={400}
                         className="w-full aspect-square object-cover"
                       />
                       <div className="absolute top-2 left-2 bg-[#F15601] text-white px-2 py-1 text-sm font-semibold">
                         {relatedProduct.category}
                       </div>
                     </div>
       
                     {/* Product Details */}
                     <div className="p-4 space-y-3">
                       <div>
                         <h3 className="text-white text-lg font-semibold leading-tight">
                           {relatedProduct.name}
                         </h3>
                         <p className="text-gray-400 text-sm mt-1 line-clamp-2">
                           {relatedProduct.description}
                         </p>
                       </div>
                       
                       <div className="text-right">
                         <div className="text-white font-bold text-xl">
                           €{relatedProduct.price.toFixed(2)}
                         </div>
                       </div>
                     </div>
                   </Link>
                 ))}
             </div>
           </div>
         </div>
       </div>
     </div>
   )
 }
