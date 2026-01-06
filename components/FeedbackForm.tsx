'use client'

import { useState } from 'react'

interface FeedbackFormProps {
  context: 'compare' | 'home' | 'neighbourhood'
  question: string
  placeholder?: string
  metadata?: Record<string, any>
  className?: string
}

export default function FeedbackForm({ 
  context, 
  question, 
  placeholder = 'Share your thoughts...',
  metadata,
  className = '' 
}: FeedbackFormProps) {
  const [feedback, setFeedback] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!feedback.trim()) return

    setSubmitting(true)
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feedback_text: feedback.trim(),
          context,
          metadata
        })
      })

      if (res.ok) {
        setSubmitted(true)
        setFeedback('')
        // Reset after 3 seconds to allow new submission
        setTimeout(() => setSubmitted(false), 3000)
      } else {
        console.error('Failed to submit feedback')
      }
    } catch (error) {
      console.error('Error submitting feedback:', error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={`bg-gray-50 border border-gray-200 rounded-lg p-4 ${className}`}>
      <p className="text-sm text-gray-700 mb-3">{question}</p>
      {submitted ? (
        <p className="text-sm text-gray-600 italic">Thank you for your feedback.</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-2">
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder={placeholder}
            rows={2}
            maxLength={500}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            disabled={submitting}
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">
              Anonymous • {feedback.length}/500
            </span>
            <button
              type="submit"
              disabled={!feedback.trim() || submitting}
              className="px-4 py-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

