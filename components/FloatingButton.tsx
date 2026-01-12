'use client'

import { useState, useEffect, useRef } from 'react'
import { HelpCircle } from 'lucide-react'
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
  scrollThreshold = 200,
  hasCompareBar = false
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

  // Position: bottom-6 when no Compare Bar, bottom-20 when Compare Bar exists
  const bottomPosition = hasCompareBar ? 'bottom-20' : 'bottom-6'

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={`fixed right-4 md:right-6 ${bottomPosition} z-40 w-12 h-12 md:w-14 md:h-14 rounded-full bg-white border-2 border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-700 shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center`}
        aria-label="Ask the builder"
        title="Ask the builder"
      >
        <HelpCircle className="w-5 h-5 md:w-6 md:h-6" />
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
