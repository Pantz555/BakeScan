"use client"

// Utility functions for mobile camera and image processing

export interface CameraConstraints {
  video: {
    facingMode: "user" | "environment"
    width: { ideal: number }
    height: { ideal: number }
  }
}

export interface ImageFilters {
  brightness: number
  contrast: number
  saturation: number
  sharpness: number
}

export interface CropArea {
  x: number
  y: number
  width: number
  height: number
}

// Get optimal camera constraints for invoice capture
export const getInvoiceCameraConstraints = (facingMode: "user" | "environment"): CameraConstraints => ({
  video: {
    facingMode,
    width: { ideal: 1920 },
    height: { ideal: 1080 },
  },
})

// Apply image enhancement filters for better OCR
export const applyOCREnhancement = (
  canvas: HTMLCanvasElement,
  image: HTMLImageElement,
  filters: Partial<ImageFilters> = {},
): string => {
  const context = canvas.getContext("2d")
  if (!context) return ""

  const { brightness = 110, contrast = 120, saturation = 90, sharpness = 1.2 } = filters

  canvas.width = image.width
  canvas.height = image.height

  // Apply filters for better text recognition
  context.filter = `
    brightness(${brightness}%) 
    contrast(${contrast}%) 
    saturate(${saturation}%)
  `

  context.drawImage(image, 0, 0)

  // Apply sharpening if needed
  if (sharpness > 1) {
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
    const sharpened = applySharpenFilter(imageData, sharpness)
    context.putImageData(sharpened, 0, 0)
  }

  return canvas.toDataURL("image/jpeg", 0.95)
}

// Apply sharpening filter for better text clarity
const applySharpenFilter = (imageData: ImageData, intensity: number): ImageData => {
  const data = imageData.data
  const width = imageData.width
  const height = imageData.height
  const output = new ImageData(width, height)

  // Sharpening kernel
  const kernel = [0, -intensity, 0, -intensity, 1 + 4 * intensity, -intensity, 0, -intensity, 0]

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      for (let c = 0; c < 3; c++) {
        let sum = 0
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const idx = ((y + ky) * width + (x + kx)) * 4 + c
            sum += data[idx] * kernel[(ky + 1) * 3 + (kx + 1)]
          }
        }
        const outputIdx = (y * width + x) * 4 + c
        output.data[outputIdx] = Math.max(0, Math.min(255, sum))
      }
      // Copy alpha channel
      output.data[(y * width + x) * 4 + 3] = data[(y * width + x) * 4 + 3]
    }
  }

  return output
}

// Crop image to specified area
export const cropImage = (canvas: HTMLCanvasElement, image: HTMLImageElement, cropArea: CropArea): string => {
  const context = canvas.getContext("2d")
  if (!context) return ""

  const sourceX = (cropArea.x / 100) * image.width
  const sourceY = (cropArea.y / 100) * image.height
  const sourceWidth = (cropArea.width / 100) * image.width
  const sourceHeight = (cropArea.height / 100) * image.height

  canvas.width = sourceWidth
  canvas.height = sourceHeight

  context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, sourceWidth, sourceHeight)

  return canvas.toDataURL("image/jpeg", 0.95)
}

// Rotate image by specified degrees
export const rotateImage = (canvas: HTMLCanvasElement, image: HTMLImageElement, degrees: number): string => {
  const context = canvas.getContext("2d")
  if (!context) return ""

  const radians = (degrees * Math.PI) / 180

  // Calculate new canvas size after rotation
  const cos = Math.abs(Math.cos(radians))
  const sin = Math.abs(Math.sin(radians))
  const newWidth = image.width * cos + image.height * sin
  const newHeight = image.width * sin + image.height * cos

  canvas.width = newWidth
  canvas.height = newHeight

  // Move to center and rotate
  context.translate(newWidth / 2, newHeight / 2)
  context.rotate(radians)
  context.drawImage(image, -image.width / 2, -image.height / 2)

  return canvas.toDataURL("image/jpeg", 0.95)
}

// Detect document edges for auto-cropping
export const detectDocumentEdges = (canvas: HTMLCanvasElement, image: HTMLImageElement): CropArea | null => {
  const context = canvas.getContext("2d")
  if (!context) return null

  canvas.width = image.width
  canvas.height = image.height
  context.drawImage(image, 0, 0)

  const imageData = context.getImageData(0, 0, canvas.width, canvas.height)

  // Simple edge detection - in a real app, you'd use more sophisticated algorithms
  // This is a placeholder that returns a reasonable crop area
  return {
    x: 5,
    y: 5,
    width: 90,
    height: 90,
  }
}

// Check if device supports camera
export const isCameraSupported = (): boolean => {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
}

// Get available camera devices
export const getCameraDevices = async (): Promise<MediaDeviceInfo[]> => {
  if (!isCameraSupported()) return []

  try {
    const devices = await navigator.mediaDevices.enumerateDevices()
    return devices.filter((device) => device.kind === "videoinput")
  } catch (error) {
    console.error("Error getting camera devices:", error)
    return []
  }
}

// Request camera permissions
export const requestCameraPermission = async (): Promise<boolean> => {
  if (!isCameraSupported()) return false

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true })
    stream.getTracks().forEach((track) => track.stop())
    return true
  } catch (error) {
    console.error("Camera permission denied:", error)
    return false
  }
}
