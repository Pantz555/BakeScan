"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import {
  Camera,
  RotateCw,
  Crop,
  Zap,
  Check,
  X,
  Upload,
  Wifi,
  WifiOff,
  Bell,
  ArrowLeft,
  FlashlightIcon as FlashOn,
  FlashlightOffIcon as FlashOff,
  SwitchCamera,
  RefreshCw,
  Eye,
  Sparkles,
  CheckCircle,
  Clock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface CapturedImage {
  id: string
  dataUrl: string
  timestamp: Date
  processed: boolean
  ocrResult?: {
    supplier: string
    amount: string
    date: string
    confidence: number
  }
  status: "pending" | "processing" | "completed" | "error"
}

interface ProcessingStep {
  id: string
  name: string
  status: "pending" | "processing" | "completed"
  progress: number
}

export default function MobileInvoiceCapture() {
  // Core state
  const [currentStep, setCurrentStep] = useState<"camera" | "preview" | "processing" | "review">("camera")
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [isOnline, setIsOnline] = useState(true)
  const [pendingUploads, setPendingUploads] = useState<CapturedImage[]>([])

  // Camera state
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [flashEnabled, setFlashEnabled] = useState(false)
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment")
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // Image editing state
  const [rotation, setRotation] = useState(0)
  const [brightness, setBrightness] = useState(100)
  const [contrast, setContrast] = useState(100)
  const [cropMode, setCropMode] = useState(false)
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, width: 100, height: 100 })

  // Processing state
  const [processingSteps, setProcessingSteps] = useState<ProcessingStep[]>([
    { id: "1", name: "Image Enhancement", status: "pending", progress: 0 },
    { id: "2", name: "Text Recognition", status: "pending", progress: 0 },
    { id: "3", name: "Data Extraction", status: "pending", progress: 0 },
    { id: "4", name: "Validation", status: "pending", progress: 0 },
  ])
  const [overallProgress, setOverallProgress] = useState(0)

  // Review state
  const [extractedData, setExtractedData] = useState({
    supplier: "",
    amount: "",
    date: "",
    invoiceNumber: "",
    confidence: 0,
  })

  // Initialize camera
  const initializeCamera = useCallback(async () => {
    try {
      const constraints = {
        video: {
          facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
        setIsCameraActive(true)
      }
    } catch (error) {
      console.error("Error accessing camera:", error)
      alert("Unable to access camera. Please check permissions.")
    }
  }, [facingMode])

  // Stop camera
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    setIsCameraActive(false)
  }, [])

  // Capture photo
  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext("2d")

    if (!context) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    context.drawImage(video, 0, 0)

    const dataUrl = canvas.toDataURL("image/jpeg", 0.9)
    setCapturedImage(dataUrl)
    setCurrentStep("preview")
    stopCamera()
  }, [stopCamera])

  // Apply image filters
  const applyFilters = useCallback(
    (imageData: string) => {
      if (!canvasRef.current) return imageData

      const canvas = canvasRef.current
      const context = canvas.getContext("2d")
      if (!context) return imageData

      const img = new Image()
      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height

        // Apply rotation
        context.save()
        context.translate(canvas.width / 2, canvas.height / 2)
        context.rotate((rotation * Math.PI) / 180)
        context.translate(-canvas.width / 2, -canvas.height / 2)

        // Apply filters
        context.filter = `brightness(${brightness}%) contrast(${contrast}%)`
        context.drawImage(img, 0, 0)
        context.restore()

        const filteredDataUrl = canvas.toDataURL("image/jpeg", 0.9)
        setCapturedImage(filteredDataUrl)
      }
      img.src = imageData
    },
    [rotation, brightness, contrast],
  )

  // Simulate processing steps
  const processImage = useCallback(async () => {
    setCurrentStep("processing")
    setOverallProgress(0)

    const steps = [...processingSteps]

    for (let i = 0; i < steps.length; i++) {
      steps[i].status = "processing"
      setProcessingSteps([...steps])

      // Simulate processing time
      for (let progress = 0; progress <= 100; progress += 10) {
        steps[i].progress = progress
        setProcessingSteps([...steps])
        setOverallProgress((i * 100 + progress) / steps.length)
        await new Promise((resolve) => setTimeout(resolve, 100))
      }

      steps[i].status = "completed"
      setProcessingSteps([...steps])
    }

    // Simulate extracted data
    setExtractedData({
      supplier: "Flour & Co. Suppliers",
      amount: "$1,245.50",
      date: "2024-01-15",
      invoiceNumber: "INV-2024-0156",
      confidence: 94,
    })

    setCurrentStep("review")
  }, [processingSteps])

  // Handle swipe gestures
  const handleSwipeApprove = useCallback(() => {
    if (!capturedImage) return

    const newInvoice: CapturedImage = {
      id: Date.now().toString(),
      dataUrl: capturedImage,
      timestamp: new Date(),
      processed: true,
      ocrResult: {
        supplier: extractedData.supplier,
        amount: extractedData.amount,
        date: extractedData.date,
        confidence: extractedData.confidence,
      },
      status: isOnline ? "completed" : "pending",
    }

    if (isOnline) {
      // Upload immediately
      console.log("Uploading invoice:", newInvoice)
      showNotification("Invoice approved and uploaded!")
    } else {
      // Store for later sync
      setPendingUploads((prev) => [...prev, newInvoice])
      showNotification("Invoice saved for sync when online")
    }

    resetCapture()
  }, [capturedImage, extractedData, isOnline])

  const handleSwipeReject = useCallback(() => {
    showNotification("Invoice rejected")
    resetCapture()
  }, [])

  // Reset to camera view
  const resetCapture = useCallback(() => {
    setCapturedImage(null)
    setRotation(0)
    setBrightness(100)
    setContrast(100)
    setCropMode(false)
    setCurrentStep("camera")
    setProcessingSteps((prev) => prev.map((step) => ({ ...step, status: "pending", progress: 0 })))
    setOverallProgress(0)
  }, [])

  // Show notification
  const showNotification = useCallback((message: string) => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("BakeScan AI", { body: message })
    }
  }, [])

  // Sync pending uploads when online
  const syncPendingUploads = useCallback(async () => {
    if (!isOnline || pendingUploads.length === 0) return

    console.log("Syncing pending uploads:", pendingUploads)
    // Simulate upload
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setPendingUploads([])
    showNotification(`${pendingUploads.length} invoices synced successfully`)
  }, [isOnline, pendingUploads, showNotification])

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  // Auto-sync when coming online
  useEffect(() => {
    if (isOnline && pendingUploads.length > 0) {
      syncPendingUploads()
    }
  }, [isOnline, syncPendingUploads, pendingUploads.length])

  // Request notification permission
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission()
    }
  }, [])

  // Initialize camera on mount
  useEffect(() => {
    if (currentStep === "camera") {
      initializeCamera()
    }
    return () => stopCamera()
  }, [currentStep, initializeCamera, stopCamera])

  return (
    <div className="min-h-screen bg-gray-900 text-white overflow-hidden">
      {/* Status Bar */}
      <div className="flex justify-between items-center p-4 bg-gray-800">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-white"
            onClick={() => (currentStep !== "camera" ? resetCapture() : window.history.back())}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Invoice Capture</h1>
        </div>

        <div className="flex items-center space-x-2">
          {pendingUploads.length > 0 && (
            <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
              {pendingUploads.length} pending
            </Badge>
          )}
          <div className="flex items-center space-x-1">
            {isOnline ? <Wifi className="h-4 w-4 text-green-400" /> : <WifiOff className="h-4 w-4 text-red-400" />}
          </div>
          <Button variant="ghost" size="icon" className="text-white">
            <Bell className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Camera View */}
      {currentStep === "camera" && (
        <div className="relative h-[calc(100vh-80px)]">
          <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />

          {/* Camera overlay */}
          <div className="absolute inset-0 flex flex-col justify-between p-6">
            {/* Top controls */}
            <div className="flex justify-between items-center">
              <Button
                variant="ghost"
                size="icon"
                className="bg-black/50 text-white rounded-full"
                onClick={() => setFlashEnabled(!flashEnabled)}
              >
                {flashEnabled ? <FlashOn className="h-5 w-5" /> : <FlashOff className="h-5 w-5" />}
              </Button>

              <div className="text-center">
                <p className="text-sm text-white/80">Position invoice in frame</p>
                <p className="text-xs text-white/60">Tap to focus, hold for manual controls</p>
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="bg-black/50 text-white rounded-full"
                onClick={() => setFacingMode(facingMode === "user" ? "environment" : "user")}
              >
                <SwitchCamera className="h-5 w-5" />
              </Button>
            </div>

            {/* Viewfinder */}
            <div className="flex-1 flex items-center justify-center">
              <div className="w-80 h-60 border-2 border-white/50 rounded-lg relative">
                <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-white"></div>
                <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-white"></div>
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-white"></div>
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-white"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-white/60 text-sm">Align invoice here</p>
                </div>
              </div>
            </div>

            {/* Bottom controls */}
            <div className="flex justify-center items-center space-x-8">
              <Button variant="ghost" size="icon" className="bg-black/50 text-white rounded-full w-12 h-12">
                <Upload className="h-6 w-6" />
              </Button>

              <Button
                className="bg-white text-black rounded-full w-20 h-20 flex items-center justify-center shadow-lg"
                onClick={capturePhoto}
                disabled={!isCameraActive}
              >
                <Camera className="h-8 w-8" />
              </Button>

              <Button variant="ghost" size="icon" className="bg-black/50 text-white rounded-full w-12 h-12">
                <Eye className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Preview & Edit View */}
      {currentStep === "preview" && capturedImage && (
        <div className="h-[calc(100vh-80px)] flex flex-col">
          {/* Image preview */}
          <div className="flex-1 relative bg-black">
            <img
              src={capturedImage || "/placeholder.svg"}
              alt="Captured invoice"
              className="w-full h-full object-contain"
              style={{
                transform: `rotate(${rotation}deg)`,
                filter: `brightness(${brightness}%) contrast(${contrast}%)`,
              }}
            />

            {cropMode && (
              <div className="absolute inset-0 bg-black/50">
                <div
                  className="absolute border-2 border-white bg-white/10"
                  style={{
                    left: `${cropArea.x}%`,
                    top: `${cropArea.y}%`,
                    width: `${cropArea.width}%`,
                    height: `${cropArea.height}%`,
                  }}
                >
                  <div className="absolute top-0 left-0 w-3 h-3 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                  <div className="absolute top-0 right-0 w-3 h-3 bg-white rounded-full translate-x-1/2 -translate-y-1/2"></div>
                  <div className="absolute bottom-0 left-0 w-3 h-3 bg-white rounded-full -translate-x-1/2 translate-y-1/2"></div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-white rounded-full translate-x-1/2 translate-y-1/2"></div>
                </div>
              </div>
            )}
          </div>

          {/* Edit controls */}
          <div className="bg-gray-800 p-4 space-y-4">
            {/* Quick actions */}
            <div className="flex justify-center space-x-4">
              <Button
                variant={cropMode ? "default" : "outline"}
                size="sm"
                onClick={() => setCropMode(!cropMode)}
                className="flex-1"
              >
                <Crop className="h-4 w-4 mr-2" />
                Crop
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRotation((prev) => (prev + 90) % 360)}
                className="flex-1"
              >
                <RotateCw className="h-4 w-4 mr-2" />
                Rotate
              </Button>
              <Button variant="outline" size="sm" onClick={() => applyFilters(capturedImage)} className="flex-1">
                <Sparkles className="h-4 w-4 mr-2" />
                Enhance
              </Button>
            </div>

            {/* Adjustment sliders */}
            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm text-gray-300">Brightness</label>
                  <span className="text-sm text-gray-400">{brightness}%</span>
                </div>
                <Slider
                  value={[brightness]}
                  onValueChange={(value) => setBrightness(value[0])}
                  min={50}
                  max={150}
                  step={5}
                  className="w-full"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm text-gray-300">Contrast</label>
                  <span className="text-sm text-gray-400">{contrast}%</span>
                </div>
                <Slider
                  value={[contrast]}
                  onValueChange={(value) => setContrast(value[0])}
                  min={50}
                  max={150}
                  step={5}
                  className="w-full"
                />
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex space-x-3 pt-2">
              <Button variant="outline" onClick={resetCapture} className="flex-1">
                <X className="h-4 w-4 mr-2" />
                Retake
              </Button>
              <Button onClick={processImage} className="flex-1 bg-amber-600 hover:bg-amber-700">
                <Zap className="h-4 w-4 mr-2" />
                Process
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Processing View */}
      {currentStep === "processing" && (
        <div className="h-[calc(100vh-80px)] flex flex-col justify-center items-center p-6">
          <div className="w-full max-w-sm space-y-6">
            {/* Overall progress */}
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-4 relative">
                <div className="absolute inset-0 rounded-full border-4 border-gray-700"></div>
                <div
                  className="absolute inset-0 rounded-full border-4 border-amber-500 transition-all duration-300"
                  style={{
                    clipPath: `polygon(50% 50%, 50% 0%, ${50 + (overallProgress / 100) * 50}% 0%, ${50 + (overallProgress / 100) * 50}% 100%, 50% 100%)`,
                  }}
                ></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold">{Math.round(overallProgress)}%</span>
                </div>
              </div>
              <h2 className="text-xl font-semibold mb-2">Processing Invoice</h2>
              <p className="text-gray-400">Extracting data with AI...</p>
            </div>

            {/* Processing steps */}
            <div className="space-y-3">
              {processingSteps.map((step) => (
                <div key={step.id} className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {step.status === "completed" ? (
                      <CheckCircle className="h-5 w-5 text-green-400" />
                    ) : step.status === "processing" ? (
                      <RefreshCw className="h-5 w-5 text-amber-400 animate-spin" />
                    ) : (
                      <Clock className="h-5 w-5 text-gray-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">{step.name}</span>
                      <span className="text-xs text-gray-400">{step.progress}%</span>
                    </div>
                    <Progress value={step.progress} className="h-1" />
                  </div>
                </div>
              ))}
            </div>

            {/* Tips */}
            <div className="bg-gray-800 rounded-lg p-4">
              <p className="text-sm text-gray-300 text-center">
                💡 Tip: Better lighting and clear text improve accuracy
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Review & Approval View */}
      {currentStep === "review" && (
        <div className="h-[calc(100vh-80px)] flex flex-col">
          {/* Extracted data */}
          <div className="flex-1 p-6 space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Review Extracted Data</h2>
              <div className="flex items-center justify-center space-x-2">
                <span className="text-sm text-gray-400">Confidence:</span>
                <Badge
                  variant="outline"
                  className={`${
                    extractedData.confidence >= 90
                      ? "bg-green-100 text-green-800 border-green-200"
                      : extractedData.confidence >= 70
                        ? "bg-amber-100 text-amber-800 border-amber-200"
                        : "bg-red-100 text-red-800 border-red-200"
                  }`}
                >
                  {extractedData.confidence}%
                </Badge>
              </div>
            </div>

            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6 space-y-4">
                <div>
                  <label className="text-sm text-gray-400">Supplier</label>
                  <p className="text-lg font-medium">{extractedData.supplier}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Amount</label>
                  <p className="text-lg font-medium text-green-400">{extractedData.amount}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Date</label>
                  <p className="text-lg font-medium">{extractedData.date}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Invoice Number</label>
                  <p className="text-lg font-medium">{extractedData.invoiceNumber}</p>
                </div>
              </CardContent>
            </Card>

            {/* Offline notice */}
            {!isOnline && (
              <Alert className="bg-amber-900/20 border-amber-700">
                <WifiOff className="h-4 w-4" />
                <AlertDescription className="text-amber-200">
                  You're offline. Invoice will be saved and synced when connection is restored.
                </AlertDescription>
              </Alert>
            )}

            {/* Swipe instructions */}
            <div className="text-center">
              <p className="text-sm text-gray-400 mb-2">Swipe to approve or reject</p>
              <div className="flex justify-center space-x-4 text-xs text-gray-500">
                <span>← Swipe left to reject</span>
                <span>Swipe right to approve →</span>
              </div>
            </div>
          </div>

          {/* Swipe action buttons */}
          <div className="p-6">
            <div className="flex space-x-4">
              <Button
                variant="outline"
                onClick={handleSwipeReject}
                className="flex-1 h-14 border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
              >
                <X className="h-6 w-6 mr-2" />
                Reject
              </Button>
              <Button onClick={handleSwipeApprove} className="flex-1 h-14 bg-green-600 hover:bg-green-700 text-white">
                <Check className="h-6 w-6 mr-2" />
                Approve
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden canvas for image processing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
