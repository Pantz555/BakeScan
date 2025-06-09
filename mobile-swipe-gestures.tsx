"use client"

import { useEffect, useRef, useState } from "react"

interface SwipeGestureOptions {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  threshold?: number
  preventDefaultTouchmoveEvent?: boolean
}

export const useSwipeGestures = (options: SwipeGestureOptions) => {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    threshold = 50,
    preventDefaultTouchmoveEvent = false,
  } = options

  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null)
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null)

  const minSwipeDistance = threshold

  const onTouchStart = (e: TouchEvent) => {
    setTouchEnd(null)
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    })
  }

  const onTouchMove = (e: TouchEvent) => {
    if (preventDefaultTouchmoveEvent) {
      e.preventDefault()
    }
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    })
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return

    const distanceX = touchStart.x - touchEnd.x
    const distanceY = touchStart.y - touchEnd.y
    const isLeftSwipe = distanceX > minSwipeDistance
    const isRightSwipe = distanceX < -minSwipeDistance
    const isUpSwipe = distanceY > minSwipeDistance
    const isDownSwipe = distanceY < -minSwipeDistance

    if (isLeftSwipe && onSwipeLeft) {
      onSwipeLeft()
    }
    if (isRightSwipe && onSwipeRight) {
      onSwipeRight()
    }
    if (isUpSwipe && onSwipeUp) {
      onSwipeUp()
    }
    if (isDownSwipe && onSwipeDown) {
      onSwipeDown()
    }
  }

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  }
}

// Hook for swipe-to-approve/reject functionality
export const useSwipeApproval = (onApprove: () => void, onReject: () => void, threshold = 100) => {
  const elementRef = useRef<HTMLDivElement>(null)
  const [swipeOffset, setSwipeOffset] = useState(0)
  const [isSwipeActive, setIsSwipeActive] = useState(false)

  const swipeGestures = useSwipeGestures({
    onSwipeLeft: () => {
      if (Math.abs(swipeOffset) > threshold) {
        onReject()
        setSwipeOffset(0)
      }
    },
    onSwipeRight: () => {
      if (Math.abs(swipeOffset) > threshold) {
        onApprove()
        setSwipeOffset(0)
      }
    },
    threshold: threshold / 2,
  })

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    let startX = 0
    let currentX = 0

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX
      setIsSwipeActive(true)
      swipeGestures.onTouchStart(e)
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!isSwipeActive) return

      currentX = e.touches[0].clientX
      const diff = currentX - startX
      setSwipeOffset(diff)
      swipeGestures.onTouchMove(e)
    }

    const handleTouchEnd = (e: TouchEvent) => {
      setIsSwipeActive(false)

      if (Math.abs(swipeOffset) < threshold) {
        setSwipeOffset(0)
      }

      swipeGestures.onTouchEnd()
    }

    element.addEventListener("touchstart", handleTouchStart, { passive: false })
    element.addEventListener("touchmove", handleTouchMove, { passive: false })
    element.addEventListener("touchend", handleTouchEnd, { passive: false })

    return () => {
      element.removeEventListener("touchstart", handleTouchStart)
      element.removeEventListener("touchmove", handleTouchMove)
      element.removeEventListener("touchend", handleTouchEnd)
    }
  }, [swipeGestures, swipeOffset, threshold, isSwipeActive])

  return {
    elementRef,
    swipeOffset,
    isSwipeActive,
  }
}
