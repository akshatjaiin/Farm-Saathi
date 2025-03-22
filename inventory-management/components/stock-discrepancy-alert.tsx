"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertTriangle, X, RefreshCw } from "lucide-react"
import { useInventoryStore } from "@/store/inventory-store"

interface StockDiscrepancyAlertProps {
  items: { name: string; actual: number; expected: number }[]
  onClose: () => void
  onUpdate: () => void
}

export default function StockDiscrepancyAlert({ items, onClose, onUpdate }: StockDiscrepancyAlertProps) {
  const { updateItemsFromDetection } = useInventoryStore()

  const handleUpdateInventory = () => {
    // Convert to the format expected by our store
    const detectedItems = items.map((item) => ({
      name: item.name,
      count: item.actual,
    }))

    updateItemsFromDetection(detectedItems)
    onUpdate()
  }

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 max-w-md w-full">
      <Alert variant="warning" className="pr-12 bg-amber-50 border-amber-200">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertTitle className="text-amber-800">Stock Discrepancy Detected!</AlertTitle>
        <AlertDescription className="text-amber-700">
          <p>Camera detection found differences in your inventory:</p>
          <ul className="list-disc pl-5 mt-1">
            {items.map((item, index) => (
              <li key={index}>
                {item.name}: Expected {item.expected}, Detected {item.actual}
              </li>
            ))}
          </ul>
          <div className="mt-3">
            <Button
              variant="outline"
              size="sm"
              className="bg-white border-amber-300 text-amber-800 hover:bg-amber-100"
              onClick={handleUpdateInventory}
            >
              <RefreshCw className="h-3 w-3 mr-2" />
              Update Inventory
            </Button>
          </div>
        </AlertDescription>
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 text-amber-800 hover:bg-amber-100"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </Alert>
    </div>
  )
}

