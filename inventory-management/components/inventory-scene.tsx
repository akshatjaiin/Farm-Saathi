"use client"

import { useEffect, useState } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Environment } from "@react-three/drei"
import { useInventoryStore } from "@/store/inventory-store"
import InventoryItems from "./inventory-items"
import InventoryControls from "./inventory-controls"
import LowStockAlert from "./low-stock-alert"
import CameraButton from "./camera-button"
import CameraFeed from "./camera-feed"
import StockDiscrepancyAlert from "./stock-discrepancy-alert"

export default function InventoryScene() {
  const { items, checkLowStock } = useInventoryStore()
  const [showAlert, setShowAlert] = useState(false)
  const [lowStockItems, setLowStockItems] = useState<string[]>([])
  const [showCamera, setShowCamera] = useState(false)
  const [showDiscrepancy, setShowDiscrepancy] = useState(false)
  const [discrepancyItems, setDiscrepancyItems] = useState<{ name: string; actual: number; expected: number }[]>([])

  useEffect(() => {
    const lowItems = checkLowStock()
    if (lowItems.length > 0) {
      setLowStockItems(lowItems)
      setShowAlert(true)
    }
  }, [items, checkLowStock])

  const handleCameraToggle = () => {
    setShowCamera(!showCamera)
  }

  const handleDetectionResults = (results: { name: string; count: number }[]) => {
    const discrepancies = results
      .map((result) => {
        // Find matching inventory item (case insensitive)
        const inventoryItem = items.find((item) => item.name.toLowerCase() === result.name.toLowerCase())

        if (inventoryItem && inventoryItem.quantity !== result.count) {
          return {
            name: inventoryItem.name,
            actual: result.count,
            expected: inventoryItem.quantity,
          }
        }
        return null
      })
      .filter(Boolean) as { name: string; actual: number; expected: number }[]

    if (discrepancies.length > 0) {
      setDiscrepancyItems(discrepancies)
      setShowDiscrepancy(true)
    }
  }

  return (
    <div className="w-full h-screen relative">
      <Canvas camera={{ position: [0, 2, 5], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
        <pointLight position={[-10, -10, -10]} />
        <InventoryItems />
        <OrbitControls />
        <Environment preset="warehouse" />
      </Canvas>

      <div className="absolute top-4 left-4 z-10">
        <CameraButton onClick={handleCameraToggle} active={showCamera} />
      </div>

      <div className="absolute top-4 right-4 z-10">
        <InventoryControls />
      </div>

      {showCamera && <CameraFeed onClose={() => setShowCamera(false)} onDetectionResults={handleDetectionResults} />}

      {showAlert && <LowStockAlert items={lowStockItems} onClose={() => setShowAlert(false)} />}

      {showDiscrepancy && (
        <StockDiscrepancyAlert
          items={discrepancyItems}
          onClose={() => setShowDiscrepancy(false)}
          onUpdate={() => setShowDiscrepancy(false)}
        />
      )}
    </div>
  )
}

