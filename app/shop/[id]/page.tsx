"use client"

import { useState, useEffect } from "react"
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
import { createClient } from "@/lib/supabase-browser"
import { Database } from "@/lib/types"

type Product = Database['public']['Tables']['products']['Row'] & {
  product_categories: {
    name: string
  } | null
  attributes?: {
    size?: string[]
    color?: string[]
  }
}

export default function ProductPage() {
  const params = useParams()
  const productId = params.id as string
  
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  
  const { toast } = useToast()
  const { cart, addToCart } = useCart()
  const [isCartSheetOpen, setIsCartSheetOpen] = useState(false)
  const [selectedSize, setSelectedSize] = useState("")
  const [selectedColor, setSelectedColor] = useState("")
  const [quantity, setQuantity] = useState(1)
  
  const supabase = createClient()

  useEffect(() => {
    if (productId) {
      fetchProduct()
      fetchRelatedProducts()
    }
  }, [productId])

  const fetchProduct = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_categories(name)
        `)
        .eq('id', productId)
        .eq('is_active', true)
        .single()

      if (error) {
        console.error('Error fetching product:', error)
        setProduct(null)
      } else {
        setProduct(data)
        // Set default selections if product has attributes
        if (data.attributes && data.attributes.size && data.attributes.size.length > 0) {
          setSelectedSize(data.attributes.size[0])
        }
        if (data.attributes && data.attributes.color && data.attributes.color.length > 0) {
          setSelectedColor(data.attributes.color[0])
        }
      }
    } catch (error) {
      console.error('Error fetching product:', error)
      setProduct(null)
    } finally {
      setLoading(false)
    }
  }

  const fetchRelatedProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_categories(name)
        `)
        .eq('is_active', true)
        .neq('id', productId)
        .limit(4)

      if (error) {
        console.error('Error fetching related products:', error)
      } else {
        setRelatedProducts(data || [])
      }
    } catch (error) {
      console.error('Error fetching related products:', error)
    }
  }

  const getQuantityInCart = () => {
    const item = cart.find(item => item.id === productId)
    return item ? item.quantity : 0
  }

  const handleAddToCart = () => {
    if (!product) return
    
    if (quantity > 0) {
      addToCart({
        id: product.id,
        name: `${product.name}${selectedSize ? ` (${selectedSize})` : ''}${selectedColor ? ` (${selectedColor})` : ''}`,
        price: product.price,
        quantity: quantity,
        eventId: "shop",
        eventTitle: "Parduotuvė",
        image: product.image_url || "/placeholder.jpg",
        color: `${selectedSize || 'N/A'} | ${selectedColor || 'N/A'}`,
        category: product.product_categories?.name || "Nekategorizuotas",
      })
      
      toast({
        title: "Pridėta į krepšelį",
        description: "Produktas sėkmingai pridėtas į krepšelį",
      })
      setIsCartSheetOpen(true)
    }
  }

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1) {
      setQuantity(newQuantity)
    }
  }

  if (loading) {
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
            <p className="text-white text-xl">Kraunama...</p>
          </div>
        </div>
      </div>
    )
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
                src={product.image_url || "/placeholder.jpg"}
                alt={product.name}
                width={600}
                height={600}
                className="w-full h-96 lg:h-[600px] object-cover"
              />
              <div className="absolute top-4 left-4 bg-[#F15601] text-white px-3 py-1 text-sm font-semibold">
                {product.product_categories?.name || "Nekategorizuotas"}
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
                {product.compare_price && product.compare_price > product.price && (
                  <div className="text-gray-400 line-through text-lg">
                    €{product.compare_price.toFixed(2)}
                  </div>
                )}
              </div>

              {/* Product Description */}
              <div>
                <p className="text-gray-300 leading-relaxed text-lg">
                  {product.description}
                </p>
              </div>

              {/* Size Selection */}
              {product.attributes?.size && product.attributes.size.length > 0 && (
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
              )}

              {/* Color Selection */}
              {product.attributes?.color && product.attributes.color.length > 0 && (
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
              )}

              {/* Stock Status */}
              {product.stock_quantity <= product.low_stock_threshold && product.stock_quantity > 0 && (
                <div className="text-yellow-400 text-sm">
                  ⚠️ Likę tik {product.stock_quantity} vnt.
                </div>
              )}
              
              {product.stock_quantity === 0 && !product.allow_backorders && (
                <div className="text-red-400 text-sm">
                  ❌ Išparduota
                </div>
              )}

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
                  disabled={product.stock_quantity === 0 && !product.allow_backorders}
                  variant="cta"
                  size="cta"
                  className="w-full font-semibold disabled:opacity-50"
                >
                  <ShoppingCart className="w-6 h-6 mr-3" />
                  {product.stock_quantity === 0 && !product.allow_backorders ? "Išparduota" : "Pridėti į krepšelį"}
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
        {relatedProducts.length > 0 && (
          <div className="border-t border-[#232C62]">
            {/* Section Title */}
            <div className="px-4 md:px-8 lg:px-16 py-6 lg:py-8">
              <h2 className="h2-public">Jums taip pat gali patikti</h2>
            </div>

            {/* Related Products Grid - no outer padding */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {relatedProducts.map((relatedProduct) => (
                <Link 
                  key={relatedProduct.id} 
                  href={`/shop/${relatedProduct.id}`}
                  className="block border border-[#232C62] hover:border-white transition-colors"
                >
                  {/* Product Image */}
                  <div className="relative">
                    <Image
                      src={relatedProduct.image_url || "/placeholder.jpg"}
                      alt={relatedProduct.name}
                      width={400}
                      height={400}
                      className="w-full aspect-square object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-[#F15601] text-white px-2 py-1 text-sm font-semibold">
                      {relatedProduct.product_categories?.name || "Nekategorizuotas"}
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="text-white text-lg font-semibold leading-tight">
                        {relatedProduct.name}
                      </h3>
                      <p className="text-gray-400 text-sm mt-1 line-clamp-2">
                        {relatedProduct.short_description || relatedProduct.description}
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-white font-bold text-xl">
                        €{relatedProduct.price.toFixed(2)}
                      </div>
                      {relatedProduct.compare_price && relatedProduct.compare_price > relatedProduct.price && (
                        <div className="text-gray-400 text-sm line-through">
                          €{relatedProduct.compare_price.toFixed(2)}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
