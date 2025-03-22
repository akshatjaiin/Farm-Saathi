"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface InventoryItem {
  id: string
  name: string
  quantity: number
  threshold: number
}

interface InventoryState {
  items: InventoryItem[]
  addItem: (item: InventoryItem) => void
  updateItemQuantity: (id: string, quantity: number) => void
  removeItem: (id: string) => void
  checkLowStock: () => string[]
  updateItemsFromDetection: (detectedItems: { name: string; count: number }[]) => void
}

// Initial inventory data with fruit-focused items
const initialItems: InventoryItem[] = [
  { id: "1", name: "Apples", quantity: 15, threshold: 10 },
  { id: "2", name: "Oranges", quantity: 8, threshold: 10 },
  { id: "3", name: "Bananas", quantity: 20, threshold: 15 },
  { id: "4", name: "Tomatoes", quantity: 5, threshold: 10 },
  { id: "5", name: "Potatoes", quantity: 30, threshold: 20 },
]

export const useInventoryStore = create<InventoryState>()(
  persist(
    (set, get) => ({
      items: initialItems,

      addItem: (item) =>
        set((state) => ({
          items: [...state.items, item],
        })),

      updateItemQuantity: (id, quantity) =>
        set((state) => ({
          items: state.items.map((item) => (item.id === id ? { ...item, quantity: Math.max(0, quantity) } : item)),
        })),

      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),

      checkLowStock: () => {
        const { items } = get()
        return items.filter((item) => item.quantity <= item.threshold).map((item) => item.name)
      },

      updateItemsFromDetection: (detectedItems) =>
        set((state) => {
          const updatedItems = [...state.items]

          detectedItems.forEach((detected) => {
            const itemIndex = updatedItems.findIndex((item) => item.name.toLowerCase() === detected.name.toLowerCase())

            if (itemIndex !== -1) {
              updatedItems[itemIndex] = {
                ...updatedItems[itemIndex],
                quantity: detected.count,
              }
            }
          })

          return { items: updatedItems }
        }),
    }),
    {
      name: "inventory-storage",
    },
  ),
)

