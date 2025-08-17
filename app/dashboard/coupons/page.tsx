"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { Plus, Edit, Trash2, Copy, Calendar, Users, Euro } from "lucide-react"
import { format } from "date-fns"

interface CouponCode {
  id: string
  code: string
  description: string | null
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  max_uses: number | null
  current_uses: number
  min_order_amount: number
  valid_from: string
  valid_until: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export default function CouponsPage() {
  const { toast } = useToast()
  const [coupons, setCoupons] = useState<CouponCode[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<CouponCode | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discount_type: 'percentage' as 'percentage' | 'fixed',
    discount_value: '',
    max_uses: '',
    min_order_amount: '',
    valid_from: format(new Date(), 'yyyy-MM-dd'),
    valid_until: '',
    is_active: true
  })

  useEffect(() => {
    fetchCoupons()
  }, [])

  const fetchCoupons = async () => {
    try {
      const response = await fetch('/api/coupons')
      if (!response.ok) throw new Error('Failed to fetch coupons')
      
      const data = await response.json()
      setCoupons(data)
    } catch (error) {
      console.error('Error fetching coupons:', error)
      toast({
        title: "Klaida",
        description: "Nepavyko gauti kuponų",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      code: '',
      description: '',
      discount_type: 'percentage',
      discount_value: '',
      max_uses: '',
      min_order_amount: '',
      valid_from: format(new Date(), 'yyyy-MM-dd'),
      valid_until: '',
      is_active: true
    })
  }

  const handleCreate = async () => {
    try {
      const response = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          discount_value: parseFloat(formData.discount_value),
          max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
          min_order_amount: parseFloat(formData.min_order_amount) || 0,
          valid_until: formData.valid_until || null
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create coupon')
      }

      toast({
        title: "Sėkmingai",
        description: "Kuponas sėkmingai sukurtas",
      })
      
      setIsCreateDialogOpen(false)
      resetForm()
      fetchCoupons()
    } catch (error) {
      console.error('Error creating coupon:', error)
      toast({
        title: "Klaida",
        description: error instanceof Error ? error.message : "Nepavyko sukurti kuponą",
        variant: "destructive",
      })
    }
  }

  const handleUpdate = async () => {
    if (!editingCoupon) return

    try {
      const response = await fetch(`/api/coupons/${editingCoupon.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          discount_value: parseFloat(formData.discount_value),
          max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
          min_order_amount: parseFloat(formData.min_order_amount) || 0,
          valid_until: formData.valid_until || null
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update coupon')
      }

      toast({
        title: "Sėkmingai",
        description: "Kuponas sėkmingai atnaujintas",
      })
      
      setEditingCoupon(null)
      resetForm()
      fetchCoupons()
    } catch (error) {
      console.error('Error updating coupon:', error)
      toast({
        title: "Klaida",
        description: error instanceof Error ? error.message : "Nepavyko atnaujinti kuponą",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Ar tikrai norite ištrinti šį kuponą?')) return

    setDeletingId(id)
    try {
      const response = await fetch(`/api/coupons/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete coupon')

      toast({
        title: "Sėkmingai",
        description: "Kuponas sėkmingai ištrintas",
      })
      
      fetchCoupons()
    } catch (error) {
      console.error('Error deleting coupon:', error)
      toast({
        title: "Klaida",
        description: "Nepavyko ištrinti kuponą",
        variant: "destructive",
      })
    } finally {
      setDeletingId(null)
    }
  }

  const handleEdit = (coupon: CouponCode) => {
    setEditingCoupon(coupon)
    setFormData({
      code: coupon.code,
      description: coupon.description || '',
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value.toString(),
      max_uses: coupon.max_uses?.toString() || '',
      min_order_amount: coupon.min_order_amount.toString(),
      valid_from: format(new Date(coupon.valid_from), 'yyyy-MM-dd'),
      valid_until: coupon.valid_until ? format(new Date(coupon.valid_until), 'yyyy-MM-dd') : '',
      is_active: coupon.is_active
    })
  }

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code)
    toast({
      title: "Nukopijuota",
      description: "Kodas nukopijuotas į iškarpinę",
    })
  }

  const getStatusBadge = (coupon: CouponCode) => {
    const now = new Date()
    const validFrom = new Date(coupon.valid_from)
    const validUntil = coupon.valid_until ? new Date(coupon.valid_until) : null

    if (!coupon.is_active) {
      return <Badge variant="secondary">Neaktyvus</Badge>
    }

    if (validFrom > now) {
      return <Badge variant="outline">Laukia</Badge>
    }

    if (validUntil && validUntil < now) {
      return <Badge variant="destructive">Baigėsi</Badge>
    }

    if (coupon.max_uses && coupon.current_uses >= coupon.max_uses) {
      return <Badge variant="destructive">Išnaudotas</Badge>
    }

    return <Badge variant="default">Aktyvus</Badge>
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Kraunama...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Kuponų kodai</h1>
          <p className="text-gray-600">Tvarkykite nuolaidų kuponus</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="h-4 w-4 mr-2" />
              Sukurti kuponą
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Sukurti naują kuponą</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="code">Kodas</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="SUMMER2024"
                />
              </div>
              <div>
                <Label htmlFor="description">Aprašymas</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Vasaros nuolaida"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="discount_type">Nuolaidos tipas</Label>
                  <Select
                    value={formData.discount_type}
                    onValueChange={(value: 'percentage' | 'fixed') => 
                      setFormData({ ...formData, discount_type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Procentai</SelectItem>
                      <SelectItem value="fixed">Fiksuota suma</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="discount_value">Nuolaidos vertė</Label>
                  <Input
                    id="discount_value"
                    type="number"
                    value={formData.discount_value}
                    onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                    placeholder={formData.discount_type === 'percentage' ? '10' : '5.00'}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="max_uses">Maksimalus naudojimų skaičius</Label>
                  <Input
                    id="max_uses"
                    type="number"
                    value={formData.max_uses}
                    onChange={(e) => setFormData({ ...formData, max_uses: e.target.value })}
                    placeholder="Neribota"
                  />
                </div>
                <div>
                  <Label htmlFor="min_order_amount">Minimali užsakymo suma</Label>
                  <Input
                    id="min_order_amount"
                    type="number"
                    step="0.01"
                    value={formData.min_order_amount}
                    onChange={(e) => setFormData({ ...formData, min_order_amount: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="valid_from">Galioja nuo</Label>
                  <Input
                    id="valid_from"
                    type="date"
                    value={formData.valid_from}
                    onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="valid_until">Galioja iki</Label>
                  <Input
                    id="valid_until"
                    type="date"
                    value={formData.valid_until}
                    onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Aktyvus</Label>
              </div>
              <Button onClick={handleCreate} className="w-full">
                Sukurti kuponą
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {coupons.map((coupon) => (
          <Card key={coupon.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-2">
                  <CardTitle className="text-lg">{coupon.code}</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(coupon.code)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(coupon)}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(coupon)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(coupon.id)}
                    disabled={deletingId === coupon.id}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center space-x-2">
                  <Euro className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Nuolaida</p>
                    <p className="font-semibold">
                      {coupon.discount_type === 'percentage' 
                        ? `${coupon.discount_value}%` 
                        : `€${coupon.discount_value.toFixed(2)}`
                      }
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Naudojimai</p>
                    <p className="font-semibold">
                      {coupon.current_uses}
                      {coupon.max_uses && ` / ${coupon.max_uses}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Galioja iki</p>
                    <p className="font-semibold">
                      {coupon.valid_until 
                        ? format(new Date(coupon.valid_until), 'yyyy-MM-dd')
                        : 'Neribota'
                      }
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Min. užsakymas</p>
                  <p className="font-semibold">€{coupon.min_order_amount.toFixed(2)}</p>
                </div>
              </div>
              {coupon.description && (
                <p className="text-sm text-gray-600 mt-2">{coupon.description}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingCoupon} onOpenChange={() => setEditingCoupon(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Redaguoti kuponą</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit_code">Kodas</Label>
              <Input
                id="edit_code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="SUMMER2024"
              />
            </div>
            <div>
              <Label htmlFor="edit_description">Aprašymas</Label>
              <Input
                id="edit_description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Vasaros nuolaida"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_discount_type">Nuolaidos tipas</Label>
                <Select
                  value={formData.discount_type}
                  onValueChange={(value: 'percentage' | 'fixed') => 
                    setFormData({ ...formData, discount_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Procentai</SelectItem>
                    <SelectItem value="fixed">Fiksuota suma</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit_discount_value">Nuolaidos vertė</Label>
                <Input
                  id="edit_discount_value"
                  type="number"
                  value={formData.discount_value}
                  onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                  placeholder={formData.discount_type === 'percentage' ? '10' : '5.00'}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_max_uses">Maksimalus naudojimų skaičius</Label>
                <Input
                  id="edit_max_uses"
                  type="number"
                  value={formData.max_uses}
                  onChange={(e) => setFormData({ ...formData, max_uses: e.target.value })}
                  placeholder="Neribota"
                />
              </div>
              <div>
                <Label htmlFor="edit_min_order_amount">Minimali užsakymo suma</Label>
                <Input
                  id="edit_min_order_amount"
                  type="number"
                  step="0.01"
                  value={formData.min_order_amount}
                  onChange={(e) => setFormData({ ...formData, min_order_amount: e.target.value })}
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_valid_from">Galioja nuo</Label>
                <Input
                  id="edit_valid_from"
                  type="date"
                  value={formData.valid_from}
                  onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit_valid_until">Galioja iki</Label>
                <Input
                  id="edit_valid_until"
                  type="date"
                  value={formData.valid_until}
                  onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit_is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="edit_is_active">Aktyvus</Label>
            </div>
            <Button onClick={handleUpdate} className="w-full">
              Atnaujinti kuponą
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
