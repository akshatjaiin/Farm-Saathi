import InventoryScene from "@/components/inventory-scene"
import { ThemeProvider } from "@/components/theme-provider"

export default function Home() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <main className="flex min-h-screen flex-col">
        <div className="absolute top-0 left-0 w-full z-10 bg-gradient-to-b from-black/50 to-transparent p-4">
          <h1 className="text-2xl font-bold text-white">🚜 FarmVision</h1>
          <p className="text-sm text-white/80">3D Inventory & AI-Powered Fruit Detection</p>
        </div>
        <InventoryScene />
      </main>
    </ThemeProvider>
  )
}

