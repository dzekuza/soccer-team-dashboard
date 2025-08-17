"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase-browser"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Plus, Edit, Trash2, Eye, Package, Layers } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Database } from "@/lib/types"
import { ProductVariantsDialog } from "./product-variants-dialog"

type Product = Database['public']['Tables']['products']['Row']
type ProductCategory = Database['public']['Tables']['product_categories']['Row']

export function ProductsTab() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [variantsDialogOpen, setVariantsDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const { toast } = useToast()
  const supabase = createClient()

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    short_description: "",
    price: "",
    compare_price: "",
    cost_price: "",
    sku: "",
    barcode: "",
         category_id: "none",
    image_url: "",
    stock_quantity: "0",
    low_stock_threshold: "5",
    min_order_quantity: "1",
    max_order_quantity: "",
    weight_grams: "",
    is_active: true,
    is_featured: false,
    allow_backorders: false,
    tags: [] as string[],
  })

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_categories(name)
        `)
        .order('created_at', { ascending: false })

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        compare_price: formData.compare_price ? parseFloat(formData.compare_price) : null,
        cost_price: formData.cost_price ? parseFloat(formData.cost_price) : null,
        stock_quantity: parseInt(formData.stock_quantity),
        low_stock_threshold: parseInt(formData.low_stock_threshold),
        min_order_quantity: parseInt(formData.min_order_quantity),
        max_order_quantity: formData.max_order_quantity ? parseInt(formData.max_order_quantity) : null,
        weight_grams: formData.weight_grams ? parseInt(formData.weight_grams) : null,
                 category_id: formData.category_id === "none" ? null : formData.category_id,
      }

      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id)

        if (error) throw error

        toast({
          title: "Sėkmingai atnaujinta",
          description: "Produktas buvo atnaujintas",
        })
      } else {
        const { error } = await supabase
          .from('products')
          .insert(productData)

        if (error) throw error

        toast({
          title: "Sėkmingai sukurta",
          description: "Naujas produktas buvo sukurtas",
        })
      }

      setIsCreateDialogOpen(false)
      setEditingProduct(null)
      resetForm()
      fetchProducts()
    } catch (error) {
      console.error('Error saving product:', error)
      toast({
        title: "Klaida",
        description: "Nepavyko išsaugoti produkto",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (productId: string) => {
    if (!confirm('Ar tikrai norite ištrinti šį produktą?')) return

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)

      if (error) throw error

      toast({
        title: "Sėkmingai ištrinta",
        description: "Produktas buvo ištrintas",
      })

      fetchProducts()
    } catch (error) {
      console.error('Error deleting product:', error)
      toast({
        title: "Klaida",
        description: "Nepavyko ištrinti produkto",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description || "",
      short_description: product.short_description || "",
      price: product.price.toString(),
      compare_price: product.compare_price?.toString() || "",
      cost_price: product.cost_price?.toString() || "",
      sku: product.sku || "",
      barcode: product.barcode || "",
             category_id: product.category_id || "none",
      image_url: product.image_url || "",
      stock_quantity: product.stock_quantity.toString(),
      low_stock_threshold: product.low_stock_threshold.toString(),
      min_order_quantity: product.min_order_quantity.toString(),
      max_order_quantity: product.max_order_quantity?.toString() || "",
      weight_grams: product.weight_grams?.toString() || "",
      is_active: product.is_active,
      is_featured: product.is_featured,
      allow_backorders: product.allow_backorders,
      tags: product.tags || [],
    })
    setIsCreateDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      short_description: "",
      price: "",
      compare_price: "",
      cost_price: "",
      sku: "",
      barcode: "",
      category_id: "none",
      image_url: "",
      stock_quantity: "0",
      low_stock_threshold: "5",
      min_order_quantity: "1",
      max_order_quantity: "",
      weight_grams: "",
      is_active: true,
      is_featured: false,
      allow_backorders: false,
      tags: [],
    })
  }

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return "Nekategorizuotas"
    const category = categories.find(c => c.id === categoryId)
    return category?.name || "Nežinoma kategorija"
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Ieškoti produktų..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingProduct(null)
              resetForm()
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Pridėti produktą
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? "Redaguoti produktą" : "Pridėti naują produktą"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Pavadinimas *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU</Label>
                  <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Aprašymas</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="short_description">Trumpas aprašymas</Label>
                <Input
                  id="short_description"
                  value={formData.short_description}
                  onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Kaina (€) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="compare_price">Palyginimo kaina (€)</Label>
                  <Input
                    id="compare_price"
                    type="number"
                    step="0.01"
                    value={formData.compare_price}
                    onChange={(e) => setFormData({ ...formData, compare_price: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cost_price">Savikaina (€)</Label>
                  <Input
                    id="cost_price"
                    type="number"
                    step="0.01"
                    value={formData.cost_price}
                    onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Kategorija</Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pasirinkite kategoriją" />
                    </SelectTrigger>
                                         <SelectContent>
                       <SelectItem value="none">Nekategorizuotas</SelectItem>
                       {categories.map((category) => (
                         <SelectItem key={category.id} value={category.id}>
                           {category.name}
                         </SelectItem>
                       ))}
                     </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image_url">Nuotraukos URL</Label>
                  <Input
                    id="image_url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stock_quantity">Atsargos kiekis</Label>
                  <Input
                    id="stock_quantity"
                    type="number"
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="min_order_quantity">Min. užsakymo kiekis</Label>
                  <Input
                    id="min_order_quantity"
                    type="number"
                    value={formData.min_order_quantity}
                    onChange={(e) => setFormData({ ...formData, min_order_quantity: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max_order_quantity">Maks. užsakymo kiekis</Label>
                  <Input
                    id="max_order_quantity"
                    type="number"
                    value={formData.max_order_quantity}
                    onChange={(e) => setFormData({ ...formData, max_order_quantity: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label htmlFor="is_active">Aktyvus</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_featured"
                    checked={formData.is_featured}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                  />
                  <Label htmlFor="is_featured">Išskirtas</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="allow_backorders"
                    checked={formData.allow_backorders}
                    onCheckedChange={(checked) => setFormData({ ...formData, allow_backorders: checked })}
                  />
                  <Label htmlFor="allow_backorders">Leisti užsakymus be atsargų</Label>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreateDialogOpen(false)
                    setEditingProduct(null)
                    resetForm()
                  }}
                >
                  Atšaukti
                </Button>
                <Button type="submit">
                  {editingProduct ? "Atnaujinti" : "Sukurti"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Produktai ({filteredProducts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Kraunama...</div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produktas</TableHead>
                  <TableHead>Kategorija</TableHead>
                  <TableHead>Kaina</TableHead>
                  <TableHead>Atsargos</TableHead>
                  <TableHead>Statusas</TableHead>
                  <TableHead className="text-right">Veiksmai</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        {product.image_url && (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-10 h-10 rounded object-cover"
                          />
                        )}
                        <div>
                          <div className="font-medium">{product.name}</div>
                          {product.sku && (
                            <div className="text-sm text-muted-foreground">SKU: {product.sku}</div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getCategoryName(product.category_id)}</TableCell>
                    <TableCell>
                      <div className="font-medium">€{product.price.toFixed(2)}</div>
                      {product.compare_price && (
                        <div className="text-sm text-muted-foreground line-through">
                          €{product.compare_price.toFixed(2)}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span className={product.stock_quantity <= product.low_stock_threshold ? "text-red-600" : ""}>
                          {product.stock_quantity}
                        </span>
                        {product.stock_quantity <= product.low_stock_threshold && (
                          <Badge variant="destructive" className="text-xs">Mažai</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {product.is_active ? (
                          <Badge variant="default">Aktyvus</Badge>
                        ) : (
                          <Badge variant="secondary">Neaktyvus</Badge>
                        )}
                        {product.is_featured && (
                          <Badge variant="outline">Išskirtas</Badge>
                        )}
                      </div>
                    </TableCell>
                                         <TableCell className="text-right">
                       <div className="flex items-center justify-end space-x-2">
                         <Button
                           variant="ghost"
                           size="sm"
                           onClick={() => {
                             setSelectedProduct(product)
                             setVariantsDialogOpen(true)
                           }}
                           title="Valdyti variantus"
                         >
                           <Layers className="h-4 w-4" />
                         </Button>
                         <Button
                           variant="ghost"
                           size="sm"
                           onClick={() => handleEdit(product)}
                         >
                           <Edit className="h-4 w-4" />
                         </Button>
                         <Button
                           variant="ghost"
                           size="sm"
                           onClick={() => handleDelete(product.id)}
                         >
                           <Trash2 className="h-4 w-4" />
                         </Button>
                       </div>
                     </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
                 </CardContent>
       </Card>

       {selectedProduct && (
         <ProductVariantsDialog
           product={selectedProduct}
           open={variantsDialogOpen}
           onOpenChange={setVariantsDialogOpen}
         />
       )}
     </div>
   )
 }
