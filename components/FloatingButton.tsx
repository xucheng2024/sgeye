'use client'

import { useState, useEffect, useRef } from 'react'
import BuilderMessageModal from './BuilderMessageModal'

interface FloatingButtonProps {
  context: Record<string, any>
  triggerAfterScroll?: boolean
  scrollThreshold?: number
}

function formatTimeOnPage(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`
  }
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  if (remainingSeconds === 0) {
    return `${minutes}m`
  }
  return `${minutes}m${remainingSeconds}s`
}

export default function FloatingButton({ 
  context, 
  triggerAfterScroll = false,
  scrollThreshold = 200 
}: FloatingButtonProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const hasShownRef = useRef(false)
  const startTimeRef = useRef<number>(Date.now())
  const [timeOnPage, setTimeOnPage] = useState<string>('')

  useEffect(() => {
    // Track time on page
    const updateTime = () => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
      setTimeOnPage(formatTimeOnPage(elapsed))
    }

    const interval = setInterval(updateTime, 1000)
    updateTime() // Initial update

    // Show after 5 seconds on first visit (always, regardless of scroll)
    const timer = setTimeout(() => {
      if (!hasShownRef.current) {
        setIsVisible(true)
        hasShownRef.current = true
      }
    }, 5000)

    // Also show immediately if triggerAfterScroll is false
    if (!triggerAfterScroll) {
      setIsVisible(true)
      hasShownRef.current = true
    }

    return () => {
      clearTimeout(timer)
      clearInterval(interval)
    }
  }, [triggerAfterScroll])

  useEffect(() => {
    if (!triggerAfterScroll) return

    const handleScroll = () => {
      // If triggerAfterScroll is enabled, show when scrolled past threshold
      if (window.scrollY > scrollThreshold && !hasShownRef.current) {
        setIsVisible(true)
        hasShownRef.current = true
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [triggerAfterScroll, scrollThreshold])

  if (!isVisible) return null

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 right-6 z-[9999] flex items-center justify-center px-5 py-2.5 rounded-full transition-all duration-300 animate-fade-in-up min-w-[140px] bg-[#F9FAFB] border border-[#E5E7EB] text-[#374151] hover:bg-gray-50"
        aria-label="Ask the builder"
      >
        <span className="text-sm font-medium">Ask the builder</span>
      </button>

      <BuilderMessageModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        context={{
          ...context,
          time_on_page: timeOnPage
        }}
      />
    </>
  )
}
