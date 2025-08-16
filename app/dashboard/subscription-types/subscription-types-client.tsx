"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { CreateSubscriptionTypeDialog } from "@/components/create-subscription-type-dialog"
import type { SubscriptionType } from "@/lib/types"
import { Plus, MoreHorizontal, Edit, Trash2, Eye, EyeOff, Search } from "lucide-react"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import { formatCurrency } from "@/lib/utils"

interface SubscriptionTypesClientProps {
    initialSubscriptionTypes: SubscriptionType[];
}

export function SubscriptionTypesClient({ initialSubscriptionTypes }: SubscriptionTypesClientProps) {
  const [subscriptionTypes, setSubscriptionTypes] = useState<SubscriptionType[]>(initialSubscriptionTypes)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingType, setEditingType] = useState<SubscriptionType | null>(null)
  const [searchFilter, setSearchFilter] = useState("")
  const { toast } = useToast()

  const fetchSubscriptionTypes = async () => {
    try {
      const response = await fetch('/api/subscription-types')
      if (!response.ok) throw new Error("Nepavyko užkrauti prenumeratos tipų")
      const data = await response.json()
      setSubscriptionTypes(data)
    } catch (error) {
      console.error("Failed to fetch subscription types:", error)
      toast({
        title: "Klaida",
        description: "Nepavyko užkrauti prenumeratos tipų",
        variant: "destructive",
      })
    }
  }

  const handleSubscriptionTypeCreated = () => {
    fetchSubscriptionTypes()
    setIsCreateOpen(false)
    setEditingType(null)
  }

  const handleEditSubscriptionType = (subscriptionType: SubscriptionType) => {
    setEditingType(subscriptionType)
    setIsCreateOpen(true)
  }

  const handleDeleteSubscriptionType = async (subscriptionTypeId: string) => {
    if (!confirm("Ar tikrai norite ištrinti šį prenumeratos tipą? Šio veiksmo atšaukti negalėsite.")) {
      return;
    }

    try {
      const response = await fetch(`/api/subscription-types/${subscriptionTypeId}`, { 
        method: "DELETE" 
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Nepavyko ištrinti prenumeratos tipo.");
      }

      toast({ 
        title: "Sėkmingai", 
        description: "Prenumeratos tipas buvo ištrintas.", 
      });
      
      // Refresh the subscription types list
      fetchSubscriptionTypes();
    } catch (error) {
      console.error("Error deleting subscription type:", error);
      toast({
        title: "Klaida",
        description: error instanceof Error ? error.message : "Nepavyko ištrinti prenumeratos tipo.",
        variant: "destructive",
      });
    }
  }

  const filteredSubscriptionTypes = subscriptionTypes.filter(type => {
    const matchesSearch = type.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
                         (type.description && type.description.toLowerCase().includes(searchFilter.toLowerCase()))
    return matchesSearch
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <Input
            placeholder="Ieškoti prenumeratos tipų..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full sm:w-64"
          />
        </div>
        <Button 
          onClick={() => {
            setEditingType(null)
            setIsCreateOpen(true)
          }} 
          className="bg-[#F15601] hover:bg-[#E04501]"
        >
          <Plus className="h-4 w-4 mr-2" />
          Sukurti prenumeratos tipą
        </Button>
      </div>

      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pavadinimas</TableHead>
              <TableHead>Aprašymas</TableHead>
              <TableHead>Kaina</TableHead>
              <TableHead>Trukmė</TableHead>
              <TableHead>Statusas</TableHead>
              <TableHead>Veiksmai</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSubscriptionTypes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  Nėra prenumeratos tipų pagal pasirinktus filtrus
                </TableCell>
              </TableRow>
            ) : (
              filteredSubscriptionTypes.map((subscriptionType) => (
                <TableRow key={subscriptionType.id}>
                  <TableCell className="font-medium">{subscriptionType.title}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {subscriptionType.description || "Nenurodyta"}
                  </TableCell>
                  <TableCell>{formatCurrency(subscriptionType.price)}</TableCell>
                  <TableCell>{subscriptionType.duration_days} dienų</TableCell>
                  <TableCell>
                    <Badge variant={subscriptionType.is_active ? "default" : "secondary"}>
                      {subscriptionType.is_active ? "Aktyvus" : "Neaktyvus"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Atidaryti meniu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditSubscriptionType(subscriptionType)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Redaguoti
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteSubscriptionType(subscriptionType.id)}
                          className="text-red-600 focus:text-red-600 focus:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Ištrinti
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {filteredSubscriptionTypes.length > 0 ? (
          filteredSubscriptionTypes.map((type) => (
            <Card key={type.id} className="bg-[#0A165B]/50 border border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">{type.title}</CardTitle>
                  <Badge variant={type.is_active ? "default" : "secondary"}>
                    {type.is_active ? "Aktyvus" : "Neaktyvus"}
                  </Badge>
                </div>
                <CardDescription className="text-gray-300">
                  {type.description || "Nenurodyta"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between text-white mb-2">
                  <strong>Kaina:</strong>
                  <span>{formatCurrency(type.price)}</span>
                </div>
                <div className="flex justify-between text-white mb-4">
                  <strong>Trukmė:</strong>
                  <span>{type.duration_days} dienų</span>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleEditSubscriptionType(type)} 
                    className="border-gray-600 text-gray-300 hover:text-white hover:bg-[#0A2065]"
                  >
                    <Edit className="h-4 w-4 mr-1" /> Redaguoti
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleDeleteSubscriptionType(type.id)} 
                    className="border-red-600 text-red-400 hover:text-white hover:bg-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-1" /> Ištrinti
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-center text-gray-300">Nėra prenumeratos tipų.</p>
        )}
      </div>

      <CreateSubscriptionTypeDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSubscriptionTypeCreated={handleSubscriptionTypeCreated}
        subscriptionType={editingType}
        isEditing={!!editingType}
      />
    </div>
  )
}
