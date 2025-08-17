"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Package, Tag, Settings, ShoppingCart } from "lucide-react"
import { ProductsTab } from "./components/products-tab"
import { CategoriesTab } from "./components/categories-tab"
import { AttributesTab } from "./components/attributes-tab"
import { OrdersTab } from "./components/orders-tab"

export function ShopClient() {
  const [activeTab, setActiveTab] = useState("products")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Parduotuvės valdymas</h1>
          <p className="text-muted-foreground">
            Valdykite produktus, kategorijas, atributus ir užsakymus
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="products" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Produktai
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Kategorijos
          </TabsTrigger>
          <TabsTrigger value="attributes" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Atributai
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            Užsakymai
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-4">
          <ProductsTab />
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <CategoriesTab />
        </TabsContent>

        <TabsContent value="attributes" className="space-y-4">
          <AttributesTab />
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <OrdersTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
