"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { 
  Eye, 
  Package, 
  Truck, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Search,
  Filter,
  Calendar,
  User,
  Mail,
  Phone,
  MapPin,
  Euro
} from "lucide-react"

interface OrderItem {
  id: string
  product_name: string
  product_sku: string
  variant_attributes: any
  quantity: number
  unit_price: number
  total_price: number
}

interface Order {
  id: string
  order_number: string
  customer_name: string
  customer_email: string
  customer_phone: string
  delivery_address: {
    street: string
    city: string
    postalCode: string
    country: string
  }
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
  subtotal: number
  discount_amount: number
  total_amount: number
  currency: string
  coupon_code: string
  coupon_discount: number
  shipping_cost: number
  tax_amount: number
  notes: string
  stripe_session_id: string
  stripe_payment_intent_id: string
  tracking_number: string
  shipped_at: string
  delivered_at: string
  created_at: string
  updated_at: string
  shop_order_items: OrderItem[]
}

const statusConfig = {
  pending: { label: 'Laukia', color: 'bg-yellow-500', icon: Clock },
  processing: { label: 'Apdorojama', color: 'bg-blue-500', icon: Package },
  shipped: { label: 'Išsiųsta', color: 'bg-purple-500', icon: Truck },
  delivered: { label: 'Pristatyta', color: 'bg-green-500', icon: CheckCircle },
  cancelled: { label: 'Atšaukta', color: 'bg-red-500', icon: XCircle },
  refunded: { label: 'Grąžinta', color: 'bg-gray-500', icon: XCircle }
}

export function OrdersTab() {
  const { toast } = useToast()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchOrders()
  }, [currentPage, statusFilter])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20'
      })
      
      if (statusFilter !== 'all') {
        params.append('status', statusFilter)
      }

      const response = await fetch(`/api/shop/orders?${params}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch orders')
      }

      setOrders(data.orders || [])
      setTotalPages(data.pagination?.totalPages || 1)
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast({
        title: "Klaida",
        description: "Nepavyko gauti užsakymų",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, status: string, trackingNumber?: string, notes?: string) => {
    try {
      const response = await fetch(`/api/shop/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          tracking_number: trackingNumber,
          notes,
          shipped_at: status === 'shipped' ? new Date().toISOString() : undefined,
          delivered_at: status === 'delivered' ? new Date().toISOString() : undefined
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update order')
      }

      toast({
        title: "Sėkminga",
        description: "Užsakymo statusas atnaujintas",
      })

      fetchOrders()
    } catch (error) {
      console.error('Error updating order:', error)
      toast({
        title: "Klaida",
        description: "Nepavyko atnaujinti užsakymo",
        variant: "destructive",
      })
    }
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('lt-LT', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatAddress = (address: any) => {
    return `${address.street}, ${address.city} ${address.postalCode}, ${address.country}`
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">...</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">...</div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Visi užsakymai</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Laukia apdorojimo</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orders.filter(o => o.status === 'pending').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Išsiųsti</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orders.filter(o => o.status === 'shipped').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pristatyti</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orders.filter(o => o.status === 'delivered').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtrai</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Paieška</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Užsakymo numeris, klientas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <Label htmlFor="status">Statusas</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Visi statusai" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Visi statusai</SelectItem>
                  <SelectItem value="pending">Laukia</SelectItem>
                  <SelectItem value="processing">Apdorojama</SelectItem>
                  <SelectItem value="shipped">Išsiųsta</SelectItem>
                  <SelectItem value="delivered">Pristatyta</SelectItem>
                  <SelectItem value="cancelled">Atšaukta</SelectItem>
                  <SelectItem value="refunded">Grąžinta</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <Card>
        <CardHeader>
          <CardTitle>Užsakymai</CardTitle>
          <CardDescription>
            Visi parduotuvės užsakymai
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nėra užsakymų</p>
              </div>
            ) : (
              filteredOrders.map((order) => {
                const statusInfo = statusConfig[order.status]
                const StatusIcon = statusInfo.icon

                return (
                  <div key={order.id} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <StatusIcon className="h-4 w-4" />
                          <Badge className={statusInfo.color}>
                            {statusInfo.label}
                          </Badge>
                        </div>
                        <div>
                          <p className="font-semibold">#{order.order_number}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(order.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">€{order.total_amount.toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">
                          {order.shop_order_items.length} prekė(s)
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium flex items-center gap-2">
                          <User className="h-4 w-4" />
                          {order.customer_name}
                        </p>
                        <p className="text-muted-foreground flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          {order.customer_email}
                        </p>
                        {order.customer_phone && (
                          <p className="text-muted-foreground flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            {order.customer_phone}
                          </p>
                        )}
                      </div>
                      <div>
                        <p className="font-medium flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          Pristatymo adresas
                        </p>
                        <p className="text-muted-foreground">
                          {formatAddress(order.delivery_address)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-2" />
                              Peržiūrėti
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Užsakymas #{order.order_number}</DialogTitle>
                              <DialogDescription>
                                Užsakymo detalės ir prekės
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-6">
                              {/* Customer Info */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <h3 className="font-semibold mb-2">Kliento informacija</h3>
                                  <div className="space-y-1 text-sm">
                                    <p><strong>Vardas:</strong> {order.customer_name}</p>
                                    <p><strong>El. paštas:</strong> {order.customer_email}</p>
                                    {order.customer_phone && (
                                      <p><strong>Telefonas:</strong> {order.customer_phone}</p>
                                    )}
                                  </div>
                                </div>
                                <div>
                                  <h3 className="font-semibold mb-2">Pristatymo adresas</h3>
                                  <div className="space-y-1 text-sm">
                                    <p>{order.delivery_address.street}</p>
                                    <p>{order.delivery_address.city} {order.delivery_address.postalCode}</p>
                                    <p>{order.delivery_address.country}</p>
                                  </div>
                                </div>
                              </div>

                              {/* Order Items */}
                              <div>
                                <h3 className="font-semibold mb-2">Prekės</h3>
                                <div className="space-y-2">
                                  {order.shop_order_items.map((item) => (
                                    <div key={item.id} className="flex items-center justify-between p-3 border rounded">
                                      <div className="flex-1">
                                        <p className="font-medium">{item.product_name}</p>
                                        {item.product_sku && (
                                          <p className="text-sm text-muted-foreground">SKU: {item.product_sku}</p>
                                        )}
                                        {item.variant_attributes && (
                                          <p className="text-sm text-muted-foreground">
                                            {Object.entries(item.variant_attributes).map(([key, value]) => `${key}: ${value}`).join(', ')}
                                          </p>
                                        )}
                                      </div>
                                      <div className="text-right">
                                        <p className="font-medium">€{item.unit_price.toFixed(2)} x {item.quantity}</p>
                                        <p className="font-bold">€{item.total_price.toFixed(2)}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Order Summary */}
                              <div className="border-t pt-4">
                                <h3 className="font-semibold mb-2">Užsakymo suvestinė</h3>
                                <div className="space-y-1 text-sm">
                                  <div className="flex justify-between">
                                    <span>Pradinė suma:</span>
                                    <span>€{order.subtotal.toFixed(2)}</span>
                                  </div>
                                  {order.discount_amount > 0 && (
                                    <div className="flex justify-between text-green-600">
                                      <span>Nuolaida:</span>
                                      <span>-€{order.discount_amount.toFixed(2)}</span>
                                    </div>
                                  )}
                                  {order.shipping_cost > 0 && (
                                    <div className="flex justify-between">
                                      <span>Pristatymas:</span>
                                      <span>€{order.shipping_cost.toFixed(2)}</span>
                                    </div>
                                  )}
                                  {order.tax_amount > 0 && (
                                    <div className="flex justify-between">
                                      <span>Mokestis:</span>
                                      <span>€{order.tax_amount.toFixed(2)}</span>
                                    </div>
                                  )}
                                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                                    <span>Iš viso:</span>
                                    <span>€{order.total_amount.toFixed(2)}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Status Update */}
                              <div className="border-t pt-4">
                                <h3 className="font-semibold mb-2">Atnaujinti statusą</h3>
                                <div className="flex flex-wrap gap-2">
                                  {Object.entries(statusConfig).map(([status, config]) => (
                                    <Button
                                      key={status}
                                      variant={order.status === status ? "default" : "outline"}
                                      size="sm"
                                      onClick={() => updateOrderStatus(order.id, status)}
                                      disabled={order.status === status}
                                    >
                                      {config.label}
                                    </Button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Puslapis {currentPage} iš {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Ankstesnis
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Kitas
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
