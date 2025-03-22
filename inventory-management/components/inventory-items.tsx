"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { Text, Box } from "@react-three/drei"
import { useInventoryStore } from "@/store/inventory-store"
import type { Group } from "three"

export default function InventoryItems() {
  const { items } = useInventoryStore()
  const groupRef = useRef<Group>(null)

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.001
    }
  })

  return (
    <group ref={groupRef}>
      {items.map((item, index) => {
        const angle = (index / items.length) * Math.PI * 2
        const radius = 2
        const x = Math.sin(angle) * radius
        const z = Math.cos(angle) * radius

        // Calculate color based on stock level
        const stockRatio = item.quantity / item.threshold
        const color = stockRatio <= 0.5 ? "#ef4444" : stockRatio <= 0.8 ? "#f59e0b" : "#22c55e"

        return (
          <group key={item.id} position={[x, 0, z]}>
            <Box args={[0.5, item.quantity / 10 + 0.1, 0.5]} position={[0, item.quantity / 20, 0]}>
              <meshStandardMaterial color={color} />
            </Box>
            <Text
              position={[0, -0.5, 0]}
              rotation={[0, -angle, 0]}
              fontSize={0.2}
              color="black"
              anchorX="center"
              anchorY="middle"
            >
              {item.name}
            </Text>
            <Text
              position={[0, -0.7, 0]}
              rotation={[0, -angle, 0]}
              fontSize={0.15}
              color={color}
              anchorX="center"
              anchorY="middle"
            >
              {item.quantity} units
            </Text>
          </group>
        )
      })}
    </group>
  )
}

