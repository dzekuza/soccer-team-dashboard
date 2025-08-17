"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase-browser"
import { PublicNavigation } from "@/components/public-navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCart } from "@/context/cart-context"
import { CartSheet } from "@/components/cart-sheet"
import { useToast } from "@/components/ui/use-toast"
import { ShoppingCart, Search, Filter, Star } from "lucide-react"
import Link from "next/link"
import { Database } from "@/lib/types"

type Product = Database['public']['Tables']['products']['Row'] & {
  product_categories: {
    name: string
  } | null
}

type ProductCategory = Database['public']['Tables']['product_categories']['Row']

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("name")
  const [isCartSheetOpen, setIsCartSheetOpen] = useState(false)
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null)
  const { toast } = useToast()
  const { addToCart } = useCart()
  const supabase = createClient()

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

  const fetchProducts = async () => {
    try {
      let query = supabase
        .from('products')
        .select(`
          *,
          product_categories(name)
        `)
        .eq('is_active', true)

             if (selectedCategory && selectedCategory !== 'all') {
         query = query.eq('category_id', selectedCategory)
       }

      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,sku.ilike.%${searchTerm}%`)
      }

      // Add sorting
      switch (sortBy) {
        case 'price_low':
          query = query.order('price', { ascending: true })
          break
        case 'price_high':
          query = query.order('price', { ascending: false })
          break
        case 'featured':
          query = query.order('is_featured', { ascending: false }).order('name', { ascending: true })
          break
        default:
          query = query.order('name', { ascending: true })
      }

      const { data, error } = await query

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error('Error fetching products:', error)
      toast({
        title: "Klaida",
        description: "Nepavyko gauti produktų",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('product_categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })

      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [searchTerm, selectedCategory, sortBy])

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      eventId: "shop",
      eventTitle: "Parduotuvė",
      image: product.image_url || "/placeholder.jpg",
      color: product.product_categories?.name || "Nekategorizuotas",
      category: product.product_categories?.name || "Nekategorizuotas",
    })
    
    toast({
      title: "Pridėta į krepšelį",
      description: "Produktas sėkmingai pridėtas į krepšelį",
    })
  }

  const getCategoryName = (categoryId: string | null | undefined) => {
    if (!categoryId) return "Nekategorizuotas"
    const category = categories.find(c => c.id === categoryId)
    return category?.name || "Nežinoma kategorija"
  }

  const getProductImage = (product: Product) => {
    if (hoveredProduct === (product.id || null) && product.gallery_urls && product.gallery_urls.length > 0) {
      return product.gallery_urls[0]
    }
    return product.image_url || "/placeholder.jpg"
  }

  return (
    <div className="min-h-screen bg-[#0A165B] text-white">
      <PublicNavigation currentPage="parduotuve" />
      <CartSheet open={isCartSheetOpen} onOpenChange={setIsCartSheetOpen} />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0A165B] to-[#1a237e] py-12">
        <div className="px-6">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">FK Banga Parduotuvė</h1>
            <p className="text-xl text-gray-300 mb-8">
              Oficialūs komandos drabužiai, aksesuarai ir suvenyrai
            </p>
            
            {/* Search and Filters */}
            <div className="max-w-4xl mx-auto space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Ieškoti produktų..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder-gray-400"
                  />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full md:w-48 bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Visos kategorijos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Visos kategorijos</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full md:w-48 bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Rūšiuoti" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Pagal pavadinimą</SelectItem>
                    <SelectItem value="price_low">Kaina: nuo mažiausios</SelectItem>
                    <SelectItem value="price_high">Kaina: nuo didžiausios</SelectItem>
                    <SelectItem value="featured">Išskirti produktai</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-xl text-gray-300">Kraunama...</div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6 px-6">
              <h2 className="text-2xl font-bold">
                Produktai ({products.length})
              </h2>
              <Button
                onClick={() => setIsCartSheetOpen(true)}
                className="bg-[#F15601] hover:bg-[#F15601]/90"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Krepšelis
              </Button>
            </div>

            {products.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-xl text-gray-300 mb-4">Nerasta produktų</div>
                <p className="text-gray-400">Pabandykite pakeisti paieškos kriterijus</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {products.map((product) => (
                  <Link 
                    key={product.id || 'unknown'} 
                    href={`/shop/${product.id || ''}`}
                    className="block"
                  >
                    <Card 
                      className="bg-transparent border-white/10 hover:bg-white/5 transition-colors rounded-none border-r border-b cursor-pointer"
                      onMouseEnter={() => setHoveredProduct(product.id || null)}
                      onMouseLeave={() => setHoveredProduct(null)}
                    >
                      <CardHeader className="p-0">
                        <div className="relative">
                          <img
                            src={getProductImage(product)}
                            alt={product.name}
                            className="w-full aspect-square object-cover transition-all duration-300"
                          />
                          {product.is_featured && (
                            <div className="absolute top-2 left-2">
                              <Badge className="bg-[#F15601] text-white">
                                <Star className="w-3 h-3 mr-1" />
                                Išskirtas
                              </Badge>
                            </div>
                          )}
                          {product.compare_price && product.compare_price > product.price && (
                            <div className="absolute top-2 right-2">
                              <Badge variant="destructive">
                                -{Math.round(((product.compare_price - product.price) / product.compare_price) * 100)}%
                              </Badge>
                            </div>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div>
                            <Badge variant="outline" className="text-xs mb-2">
                              {getCategoryName(product.category_id)}
                            </Badge>
                            <CardTitle className="text-lg font-semibold line-clamp-2">
                              {product.name}
                            </CardTitle>
                          </div>
                          
                          <p className="text-gray-300 text-sm line-clamp-2">
                            {product.short_description || product.description}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-xl font-bold text-[#F15601]">
                                €{product.price.toFixed(2)}
                              </div>
                              {product.compare_price && product.compare_price > product.price && (
                                <div className="text-sm text-gray-400 line-through">
                                  €{product.compare_price.toFixed(2)}
                                </div>
                              )}
                            </div>
                            
                            <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                              <Button
                                size="sm"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleAddToCart(product);
                                }}
                                className="bg-[#F15601] hover:bg-[#F15601]/90"
                              >
                                <ShoppingCart className="w-4 h-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                }}
                              >
                                Peržiūrėti
                              </Button>
                            </div>
                          </div>
                          
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
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
