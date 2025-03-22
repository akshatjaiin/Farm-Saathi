"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertCircle, X } from "lucide-react"

interface LowStockAlertProps {
  items: string[]
  onClose: () => void
}

export default function LowStockAlert({ items, onClose }: LowStockAlertProps) {
  return (
    <div className="absolute bottom-4 left-4 z-20 max-w-md">
      <Alert variant="destructive" className="pr-12">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Low Stock Alert!</AlertTitle>
        <AlertDescription>
          <p>The following items are running low:</p>
          <ul className="list-disc pl-5 mt-1">
            {items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </AlertDescription>
        <Button variant="ghost" size="icon" className="absolute top-2 right-2" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </Alert>
    </div>
  )
}

