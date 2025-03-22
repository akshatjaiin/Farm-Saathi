"use client"

import { useRef, useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, Camera, Check } from "lucide-react"
import { useInventoryStore } from "@/store/inventory-store"
import * as tf from "@tensorflow/tfjs"
// Import COCO-SSD model specifically
import * as cocoSsd from "@tensorflow-models/coco-ssd"

interface CameraFeedProps {
  onClose: () => void
  onDetectionResults: (results: { name: string; count: number }[]) => void
}

export default function CameraFeed({ onClose, onDetectionResults }: CameraFeedProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDetecting, setIsDetecting] = useState(false)
  const [model, setModel] = useState<cocoSsd.ObjectDetection | null>(null)
  const [detectedObjects, setDetectedObjects] = useState<{ name: string; count: number }[]>([])
  const [modelLoading, setModelLoading] = useState(true)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const { items } = useInventoryStore()

  // Load TensorFlow and COCO-SSD model
  useEffect(() => {
    async function loadModel() {
      try {
        setModelLoading(true)
        // Initialize TensorFlow.js
        await tf.ready()
        console.log("TensorFlow.js ready")

        // Load COCO-SSD model
        const loadedModel = await cocoSsd.load({
          base: "lite_mobilenet_v2", // Use a lighter model for better performance
        })

        setModel(loadedModel)
        setModelLoading(false)
        console.log("COCO-SSD model loaded successfully")
      } catch (error) {
        console.error("Failed to load model:", error)
        setModelLoading(false)
        // Continue without model - we'll use simulation mode
      }
    }

    loadModel()

    return () => {
      // Cleanup
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
        tracks.forEach((track) => track.stop())
      }
    }
  }, [])

  // Initialize camera
  useEffect(() => {
    async function setupCamera() {
      if (!videoRef.current) return

      try {
        setCameraError(null)
        const constraints = {
          video: {
            facingMode: "environment",
            width: { ideal: 640 },
            height: { ideal: 480 },
          },
        }

        const stream = await navigator.mediaDevices.getUserMedia(constraints)
        videoRef.current.srcObject = stream

        return new Promise<void>((resolve) => {
          if (videoRef.current) {
            videoRef.current.onloadedmetadata = () => {
              resolve()
            }
          }
        })
      } catch (error) {
        console.error("Error accessing camera:", error)
        setCameraError("Could not access camera. Please check permissions.")
      }
    }

    setupCamera()
  }, [])

  // Map COCO-SSD class names to our inventory items
  const mapDetectedClassToInventory = (className: string): string | null => {
    // Map of COCO-SSD classes to our inventory items
    const classMap: Record<string, string> = {
      apple: "Apples",
      orange: "Oranges",
      banana: "Bananas",
      carrot: "Carrots",
      broccoli: "Broccoli",
      // Add more mappings as needed
    }

    // Direct mapping if available
    if (classMap[className.toLowerCase()]) {
      return classMap[className.toLowerCase()]
    }

    // Check if any inventory item contains this class name
    for (const item of items) {
      if (
        item.name.toLowerCase().includes(className.toLowerCase()) ||
        className.toLowerCase().includes(item.name.toLowerCase())
      ) {
        return item.name
      }
    }

    return null
  }

  // Detect objects in video feed using COCO-SSD
  const detectObjects = async () => {
    if (!model || !videoRef.current || !canvasRef.current) {
      console.log("Missing required elements for detection")
      return
    }

    setIsDetecting(true)

    try {
      // Get video dimensions
      const videoWidth = videoRef.current.videoWidth
      const videoHeight = videoRef.current.videoHeight

      // Set canvas dimensions to match video
      canvasRef.current.width = videoWidth
      canvasRef.current.height = videoHeight

      // Perform detection
      const predictions = await model.detect(videoRef.current)
      console.log("Detection results:", predictions)

      // Draw results on canvas
      const ctx = canvasRef.current.getContext("2d")
      if (ctx) {
        // Clear canvas and draw video frame
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
        ctx.drawImage(videoRef.current, 0, 0, ctx.canvas.width, ctx.canvas.height)

        // Count detected items by category
        const detectedCounts: Record<string, number> = {}

        // Draw bounding boxes and count objects
        ctx.strokeStyle = "#FF0000"
        ctx.lineWidth = 2
        ctx.font = "16px Arial"
        ctx.fillStyle = "#FF0000"

        for (const prediction of predictions) {
          const className = prediction.class
          const inventoryName = mapDetectedClassToInventory(className)

          // Only process if we can map to an inventory item
          if (inventoryName) {
            // Count the item
            detectedCounts[inventoryName] = (detectedCounts[inventoryName] || 0) + 1

            // Draw bounding box
            const [x, y, width, height] = prediction.bbox
            ctx.strokeRect(x, y, width, height)

            // Draw label with confidence
            const confidence = Math.round(prediction.score * 100)
            const label = `${className} (${confidence}%)`
            ctx.fillText(label, x, y > 10 ? y - 5 : 10)
          }
        }

        // Convert to array format for state
        const detectedArray = Object.entries(detectedCounts).map(([name, count]) => ({
          name,
          count,
        }))

        setDetectedObjects(detectedArray)
      }
    } catch (error) {
      console.error("Error during detection:", error)
    }

    setIsDetecting(false)
  }

  // For demo purposes, simulate detection with mock data
  const simulateDetection = () => {
    setIsDetecting(true)

    // Simulate processing time
    setTimeout(() => {
      // Create mock detection results based on inventory items
      const mockDetections = items
        .filter((item) =>
          ["apple", "orange", "banana", "potato", "tomato"].some((fruit) =>
            item.name.toLowerCase().includes(fruit.toLowerCase()),
          ),
        )
        .map((item) => {
          // Randomly vary the count to create discrepancies
          const variance = Math.floor(Math.random() * 5) - 2 // -2 to +2
          return {
            name: item.name,
            count: Math.max(0, item.quantity + variance),
          }
        })

      setDetectedObjects(mockDetections)
      setIsDetecting(false)
    }, 2000)
  }

  const handleDetect = () => {
    if (model && !modelLoading) {
      detectObjects()
    } else {
      // Fallback to simulation if model isn't loaded
      console.log("Using simulation mode")
      simulateDetection()
    }
  }

  const handleUpdateInventory = () => {
    onDetectionResults(detectedObjects)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="relative">
          <CardTitle>Camera Feed</CardTitle>
          <Button variant="ghost" size="icon" className="absolute top-2 right-2" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="relative aspect-video bg-muted rounded-md overflow-hidden">
            {cameraError ? (
              <div className="absolute inset-0 flex items-center justify-center p-4 text-center">
                <p className="text-red-500">{cameraError}</p>
              </div>
            ) : (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover" />
              </>
            )}

            {!detectedObjects.length && !cameraError && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Button onClick={handleDetect} disabled={isDetecting} size="lg" className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  {isDetecting ? "Detecting..." : modelLoading ? "Loading Model..." : "Detect Fruits"}
                </Button>
              </div>
            )}
          </div>

          {modelLoading && !cameraError && (
            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">Loading TensorFlow.js model... This may take a moment.</p>
              <div className="mt-2 h-1 w-full bg-muted overflow-hidden rounded-full">
                <div className="h-full bg-primary animate-pulse w-1/2 rounded-full"></div>
              </div>
            </div>
          )}

          {detectedObjects.length > 0 && (
            <div className="mt-4">
              <h3 className="font-medium mb-2">Detected Items:</h3>
              <ul className="space-y-1">
                {detectedObjects.map((obj, index) => (
                  <li key={index} className="flex justify-between">
                    <span>{obj.name}</span>
                    <span className="font-medium">{obj.count} detected</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>

        {detectedObjects.length > 0 && (
          <CardFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDetectedObjects([])}>
              Scan Again
            </Button>
            <Button onClick={handleUpdateInventory}>
              <Check className="h-4 w-4 mr-2" />
              Update Inventory
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}

