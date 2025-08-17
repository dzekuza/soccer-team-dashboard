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
import { Plus, Edit, Trash2, Settings } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Database } from "@/lib/types"

type ProductAttribute = Database['public']['Tables']['product_attributes']['Row']

export function AttributesTab() {
  const [attributes, setAttributes] = useState<ProductAttribute[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingAttribute, setEditingAttribute] = useState<ProductAttribute | null>(null)
  const { toast } = useToast()
  const supabase = createClient()

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    type: "text",
    options: [] as string[],
    is_required: false,
    sort_order: 0,
  })

  // Options input state
  const [optionsInput, setOptionsInput] = useState("")

  useEffect(() => {
    fetchAttributes()
  }, [])

  const fetchAttributes = async () => {
    try {
      const { data, error } = await supabase
        .from('product_attributes')
        .select('*')
        .order('sort_order', { ascending: true })

      if (error) throw error
      setAttributes(data || [])
    } catch (error) {
      console.error('Error fetching attributes:', error)
      toast({
        title: "Klaida",
        description: "Nepavyko gauti atributų",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const attributeData = {
        ...formData,
        sort_order: parseInt(formData.sort_order.toString()),
        options: formData.type === 'select' ? formData.options : null,
      }

      if (editingAttribute) {
        const { error } = await supabase
          .from('product_attributes')
          .update(attributeData)
          .eq('id', editingAttribute.id)

        if (error) throw error

        toast({
          title: "Sėkmingai atnaujinta",
          description: "Atributas buvo atnaujintas",
        })
      } else {
        const { error } = await supabase
          .from('product_attributes')
          .insert(attributeData)

        if (error) throw error

        toast({
          title: "Sėkmingai sukurta",
          description: "Naujas atributas buvo sukurtas",
        })
      }

      setIsCreateDialogOpen(false)
      setEditingAttribute(null)
      resetForm()
      fetchAttributes()
    } catch (error) {
      console.error('Error saving attribute:', error)
      toast({
        title: "Klaida",
        description: "Nepavyko išsaugoti atributo",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (attributeId: string) => {
    if (!confirm('Ar tikrai norite ištrinti šį atributą?')) return

    try {
      const { error } = await supabase
        .from('product_attributes')
        .delete()
        .eq('id', attributeId)

      if (error) throw error

      toast({
        title: "Sėkmingai ištrinta",
        description: "Atributas buvo ištrintas",
      })

      fetchAttributes()
    } catch (error) {
      console.error('Error deleting attribute:', error)
      toast({
        title: "Klaida",
        description: "Nepavyko ištrinti atributo",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (attribute: ProductAttribute) => {
    setEditingAttribute(attribute)
    setFormData({
      name: attribute.name,
      type: attribute.type,
      options: Array.isArray(attribute.options) ? attribute.options : [],
      is_required: attribute.is_required,
      sort_order: attribute.sort_order,
    })
    setIsCreateDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      name: "",
      type: "text",
      options: [],
      is_required: false,
      sort_order: 0,
    })
    setOptionsInput("")
  }

  const addOption = () => {
    if (optionsInput.trim() && !formData.options.includes(optionsInput.trim())) {
      setFormData({
        ...formData,
        options: [...formData.options, optionsInput.trim()]
      })
      setOptionsInput("")
    }
  }

  const removeOption = (index: number) => {
    setFormData({
      ...formData,
      options: formData.options.filter((_, i) => i !== index)
    })
  }

  const filteredAttributes = attributes.filter(attribute =>
    attribute.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getTypeLabel = (type: string) => {
    const types = {
      text: "Tekstas",
      number: "Skaičius",
      select: "Pasirinkimas",
      boolean: "Taip/Ne"
    }
    return types[type as keyof typeof types] || type
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Ieškoti atributų..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingAttribute(null)
              resetForm()
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Pridėti atributą
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingAttribute ? "Redaguoti atributą" : "Pridėti naują atributą"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                <Label htmlFor="type">Tipas *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Tekstas</SelectItem>
                    <SelectItem value="number">Skaičius</SelectItem>
                    <SelectItem value="select">Pasirinkimas</SelectItem>
                    <SelectItem value="boolean">Taip/Ne</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.type === 'select' && (
                <div className="space-y-2">
                  <Label>Pasirinkimai</Label>
                  <div className="space-y-2">
                    <div className="flex space-x-2">
                      <Input
                        value={optionsInput}
                        onChange={(e) => setOptionsInput(e.target.value)}
                        placeholder="Įveskite pasirinkimą"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addOption())}
                      />
                      <Button type="button" onClick={addOption} size="sm">
                        Pridėti
                      </Button>
                    </div>
                    {formData.options.length > 0 && (
                      <div className="space-y-1">
                        {formData.options.map((option, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                            <span>{option}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeOption(index)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sort_order">Rūšiavimo tvarka</Label>
                  <Input
                    id="sort_order"
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="flex items-center space-x-2 pt-6">
                  <Switch
                    id="is_required"
                    checked={formData.is_required}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_required: checked })}
                  />
                  <Label htmlFor="is_required">Privalomas</Label>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreateDialogOpen(false)
                    setEditingAttribute(null)
                    resetForm()
                  }}
                >
                  Atšaukti
                </Button>
                <Button type="submit">
                  {editingAttribute ? "Atnaujinti" : "Sukurti"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Atributai ({filteredAttributes.length})</CardTitle>
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
                  <TableHead>Atributas</TableHead>
                  <TableHead>Tipas</TableHead>
                  <TableHead>Pasirinkimai</TableHead>
                  <TableHead>Rūšiavimas</TableHead>
                  <TableHead>Statusas</TableHead>
                  <TableHead className="text-right">Veiksmai</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAttributes.map((attribute) => (
                  <TableRow key={attribute.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{attribute.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Sukurta: {new Date(attribute.created_at).toLocaleDateString('lt-LT')}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{getTypeLabel(attribute.type)}</Badge>
                    </TableCell>
                    <TableCell>
                      {attribute.type === 'select' && Array.isArray(attribute.options) ? (
                        <div className="flex flex-wrap gap-1">
                          {attribute.options.slice(0, 3).map((option, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {option}
                            </Badge>
                          ))}
                          {attribute.options.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{attribute.options.length - 3} daugiau
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>{attribute.sort_order}</TableCell>
                    <TableCell>
                      {attribute.is_required ? (
                        <Badge variant="default">Privalomas</Badge>
                      ) : (
                        <Badge variant="secondary">Neprivalomas</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(attribute)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(attribute.id)}
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
  )
}
