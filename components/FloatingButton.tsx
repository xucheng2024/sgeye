'use client'

import { useState, useEffect, useRef } from 'react'
import { Mail } from 'lucide-react'
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
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const hasShownRef = useRef(false)
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)
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

    // Show after 5 seconds on first visit
    const timer = setTimeout(() => {
      if (!hasShownRef.current) {
        setIsVisible(true)
        hasShownRef.current = true
      }
    }, 5000)

    return () => {
      clearTimeout(timer)
      clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    if (!triggerAfterScroll) return

    const handleScroll = () => {
      // Clear existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }

      // Show if scrolled past threshold
      if (window.scrollY > scrollThreshold && !hasShownRef.current) {
        setIsVisible(true)
        hasShownRef.current = true
      }

      // Collapse on scroll
      if (window.scrollY > 50) {
        setIsCollapsed(true)
      } else {
        setIsCollapsed(false)
      }

      // Debounce collapse state
      scrollTimeoutRef.current = setTimeout(() => {
        // Keep collapsed state
      }, 100)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
    }
  }, [triggerAfterScroll, scrollThreshold])

  if (!isVisible) return null

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={`fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-all duration-300 ${
          isCollapsed
            ? 'w-12 h-12 p-0 justify-center bg-[#F9FAFB] border-[#E5E7EB] text-[#111827] hover:bg-[#F3F4F6]'
            : 'bg-[#F9FAFB] border-[#E5E7EB] text-[#111827] hover:bg-[#F3F4F6] shadow-sm'
        }`}
        aria-label="Ask the builder"
      >
        {isCollapsed ? (
          <Mail className="w-5 h-5" />
        ) : (
          <>
            <Mail className="w-4 h-4" />
            <span className="text-sm font-medium">Ask the builder</span>
          </>
        )}
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
