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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Plus, Edit, Trash2, Package } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Database } from "@/lib/types"
import { ImageUpload } from "@/components/ui/image-upload"

type Product = Database['public']['Tables']['products']['Row']
type ProductVariant = Database['public']['Tables']['product_variants']['Row']
type ProductAttribute = Database['public']['Tables']['product_attributes']['Row']

interface ProductVariantsDialogProps {
  product: Product
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProductVariantsDialog({ product, open, onOpenChange }: ProductVariantsDialogProps) {
  const [variants, setVariants] = useState<ProductVariant[]>([])
  const [attributes, setAttributes] = useState<ProductAttribute[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null)
  const { toast } = useToast()
  const supabase = createClient()

  // Form state
  const [formData, setFormData] = useState({
    sku: "",
    barcode: "",
    price: "",
    compare_price: "",
    cost_price: "",
    stock_quantity: "0",
    weight_grams: "",
    image_url: "",
    is_active: true,
    attributes: {} as Record<string, string>,
  })

  // Available attribute values
  const [attributeValues, setAttributeValues] = useState<Record<string, string[]>>({})

  useEffect(() => {
    if (open) {
      fetchVariants()
      fetchAttributes()
    }
  }, [open])

  const fetchVariants = async () => {
    try {
      const { data, error } = await supabase
        .from('product_variants')
        .select('*')
        .eq('product_id', product.id)
        .order('created_at', { ascending: true })

      if (error) throw error
      setVariants(data || [])
    } catch (error) {
      console.error('Error fetching variants:', error)
      toast({
        title: "Klaida",
        description: "Nepavyko gauti variantų",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchAttributes = async () => {
    try {
      const { data, error } = await supabase
        .from('product_attributes')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })

      if (error) throw error
      setAttributes(data || [])

      // Build attribute values object
      const values: Record<string, string[]> = {}
      data?.forEach(attr => {
        if (attr.type === 'select' && Array.isArray(attr.options)) {
          values[attr.name] = attr.options
        }
      })
      setAttributeValues(values)
    } catch (error) {
      console.error('Error fetching attributes:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const variantData = {
        product_id: product.id,
        sku: formData.sku || null,
        barcode: formData.barcode || null,
        price: formData.price ? parseFloat(formData.price) : null,
        compare_price: formData.compare_price ? parseFloat(formData.compare_price) : null,
        cost_price: formData.cost_price ? parseFloat(formData.cost_price) : null,
        stock_quantity: parseInt(formData.stock_quantity),
        weight_grams: formData.weight_grams ? parseInt(formData.weight_grams) : null,
        image_url: formData.image_url || null,
        attributes: formData.attributes,
        is_active: formData.is_active,
      }

      if (editingVariant) {
        const { error } = await supabase
          .from('product_variants')
          .update(variantData)
          .eq('id', editingVariant.id)

        if (error) throw error

        toast({
          title: "Sėkmingai atnaujinta",
          description: "Variantas buvo atnaujintas",
        })
      } else {
        const { error } = await supabase
          .from('product_variants')
          .insert(variantData)

        if (error) throw error

        toast({
          title: "Sėkmingai sukurta",
          description: "Naujas variantas buvo sukurtas",
        })
      }

      setIsCreateDialogOpen(false)
      setEditingVariant(null)
      resetForm()
      fetchVariants()
    } catch (error) {
      console.error('Error saving variant:', error)
      toast({
        title: "Klaida",
        description: "Nepavyko išsaugoti varianto",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (variantId: string) => {
    if (!confirm('Ar tikrai norite ištrinti šį variantą?')) return

    try {
      const { error } = await supabase
        .from('product_variants')
        .delete()
        .eq('id', variantId)

      if (error) throw error

      toast({
        title: "Sėkmingai ištrinta",
        description: "Variantas buvo ištrintas",
      })

      fetchVariants()
    } catch (error) {
      console.error('Error deleting variant:', error)
      toast({
        title: "Klaida",
        description: "Nepavyko ištrinti varianto",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (variant: ProductVariant) => {
    setEditingVariant(variant)
    setFormData({
      sku: variant.sku || "",
      barcode: variant.barcode || "",
      price: variant.price?.toString() || "",
      compare_price: variant.compare_price?.toString() || "",
      cost_price: variant.cost_price?.toString() || "",
      stock_quantity: variant.stock_quantity.toString(),
      weight_grams: variant.weight_grams?.toString() || "",
      image_url: variant.image_url || "",
      is_active: variant.is_active,
      attributes: variant.attributes || {},
    })
    setIsCreateDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      sku: "",
      barcode: "",
      price: "",
      compare_price: "",
      cost_price: "",
      stock_quantity: "0",
      weight_grams: "",
      image_url: "",
      is_active: true,
      attributes: {},
    })
  }

  const updateAttribute = (attributeName: string, value: string) => {
    setFormData({
      ...formData,
      attributes: {
        ...formData.attributes,
        [attributeName]: value,
      },
    })
  }

  const getAttributeDisplay = (attributes: any) => {
    if (!attributes || typeof attributes !== 'object') return "-"
    return Object.entries(attributes)
      .map(([key, value]) => `${key}: ${value}`)
      .join(", ")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Produkto variantai: {product.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Sukurkite produktų variantus su skirtingomis savybėmis (dydis, spalva, etc.)
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => {
                  setEditingVariant(null)
                  resetForm()
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Pridėti variantą
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingVariant ? "Redaguoti variantą" : "Pridėti naują variantą"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="sku">SKU</Label>
                      <Input
                        id="sku"
                        value={formData.sku}
                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="barcode">Barkodas</Label>
                      <Input
                        id="barcode"
                        value={formData.barcode}
                        onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">Kaina (€)</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
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
                      <Label htmlFor="stock_quantity">Atsargos kiekis</Label>
                      <Input
                        id="stock_quantity"
                        type="number"
                        value={formData.stock_quantity}
                        onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="weight_grams">Svoris (g)</Label>
                      <Input
                        id="weight_grams"
                        type="number"
                        value={formData.weight_grams}
                        onChange={(e) => setFormData({ ...formData, weight_grams: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Variantų nuotrauka</Label>
                    <ImageUpload
                      value={formData.image_url}
                      onChange={(value) => setFormData({ ...formData, image_url: value as string })}
                      multiple={false}
                      maxFiles={1}
                    />
                  </div>

                  {/* Dynamic attributes */}
                  {attributes.length > 0 && (
                    <div className="space-y-4">
                      <Label>Atributai</Label>
                      <div className="grid grid-cols-2 gap-4">
                        {attributes.map((attribute) => (
                          <div key={attribute.id} className="space-y-2">
                            <Label>{attribute.name}</Label>
                            {attribute.type === 'select' && Array.isArray(attribute.options) ? (
                              <Select
                                value={formData.attributes[attribute.name] || ""}
                                onValueChange={(value) => updateAttribute(attribute.name, value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder={`Pasirinkite ${attribute.name}`} />
                                </SelectTrigger>
                                                                 <SelectContent>
                                   {attribute.options.map((option) => (
                                     <SelectItem key={option} value={option}>
                                       {option}
                                     </SelectItem>
                                   ))}
                                 </SelectContent>
                              </Select>
                            ) : (
                              <Input
                                value={formData.attributes[attribute.name] || ""}
                                onChange={(e) => updateAttribute(attribute.name, e.target.value)}
                                placeholder={`Įveskite ${attribute.name}`}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                    />
                    <Label htmlFor="is_active">Aktyvus</Label>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsCreateDialogOpen(false)
                        setEditingVariant(null)
                        resetForm()
                      }}
                    >
                      Atšaukti
                    </Button>
                    <Button type="submit">
                      {editingVariant ? "Atnaujinti" : "Sukurti"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Variantai ({variants.length})</CardTitle>
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
                      <TableHead>Variantas</TableHead>
                      <TableHead>Atributai</TableHead>
                      <TableHead>Kaina</TableHead>
                      <TableHead>Atsargos</TableHead>
                      <TableHead>Statusas</TableHead>
                      <TableHead className="text-right">Veiksmai</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {variants.map((variant) => (
                      <TableRow key={variant.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            {variant.image_url && (
                              <img
                                src={variant.image_url}
                                alt="Variant"
                                className="w-10 h-10 rounded object-cover"
                              />
                            )}
                            <div>
                              <div className="font-medium">
                                {variant.sku || `Variant ${variant.id.slice(0, 8)}`}
                              </div>
                              {variant.barcode && (
                                <div className="text-sm text-muted-foreground">
                                  Barkodas: {variant.barcode}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            {getAttributeDisplay(variant.attributes)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {variant.price ? `€${variant.price.toFixed(2)}` : "Nenustatyta"}
                          </div>
                          {variant.compare_price && (
                            <div className="text-sm text-muted-foreground line-through">
                              €{variant.compare_price.toFixed(2)}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className={variant.stock_quantity <= 5 ? "text-red-600" : ""}>
                            {variant.stock_quantity}
                          </span>
                        </TableCell>
                        <TableCell>
                          {variant.is_active ? (
                            <Badge variant="default">Aktyvus</Badge>
                          ) : (
                            <Badge variant="secondary">Neaktyvus</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(variant)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(variant.id)}
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
        </div>
      </DialogContent>
    </Dialog>
  )
}
