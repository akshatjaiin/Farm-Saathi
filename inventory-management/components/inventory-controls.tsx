"use client"

import { useState } from "react"
import { useInventoryStore } from "@/store/inventory-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Minus } from "lucide-react"

export default function InventoryControls() {
  const { items, updateItemQuantity, addItem } = useInventoryStore()
  const [newItemName, setNewItemName] = useState("")
  const [newItemQuantity, setNewItemQuantity] = useState(10)
  const [newItemThreshold, setNewItemThreshold] = useState(5)
  const [isAdding, setIsAdding] = useState(false)

  const handleAddItem = () => {
    if (newItemName.trim()) {
      addItem({
        id: Date.now().toString(),
        name: newItemName,
        quantity: newItemQuantity,
        threshold: newItemThreshold,
      })
      setNewItemName("")
      setNewItemQuantity(10)
      setNewItemThreshold(5)
      setIsAdding(false)
    }
  }

  return (
    <Card className="w-[300px] bg-white/90 dark:bg-gray-900/90 backdrop-blur">
      <CardHeader>
        <CardTitle className="text-lg">Inventory Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between">
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-muted-foreground">
                  {item.quantity} units (min: {item.threshold})
                </p>
              </div>
              <div className="flex space-x-1">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                  disabled={item.quantity <= 0}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => updateItemQuantity(item.id, item.quantity + 1)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}

          {isAdding ? (
            <div className="space-y-2 pt-2 border-t">
              <div className="grid gap-1.5">
                <Label htmlFor="name">Item Name</Label>
                <Input
                  id="name"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="Enter item name"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="grid gap-1.5">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={newItemQuantity}
                    onChange={(e) => setNewItemQuantity(Number.parseInt(e.target.value) || 0)}
                    min={0}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="threshold">Min Threshold</Label>
                  <Input
                    id="threshold"
                    type="number"
                    value={newItemThreshold}
                    onChange={(e) => setNewItemThreshold(Number.parseInt(e.target.value) || 0)}
                    min={1}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-2">
                <Button variant="outline" onClick={() => setIsAdding(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddItem}>Add Item</Button>
              </div>
            </div>
          ) : (
            <Button className="w-full" variant="outline" onClick={() => setIsAdding(true)}>
              Add New Item
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

