"use client"

import { Button } from "@/components/ui/button"
import { Camera } from "lucide-react"

interface CameraButtonProps {
  onClick: () => void
  active: boolean
}

export default function CameraButton({ onClick, active }: CameraButtonProps) {
  return (
    <Button onClick={onClick} variant={active ? "default" : "outline"} size="icon" className="h-10 w-10 rounded-full">
      <Camera className="h-5 w-5" />
      <span className="sr-only">Open Camera</span>
    </Button>
  )
}

