'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

interface BuilderMessageModalProps {
  isOpen: boolean
  onClose: () => void
  context: Record<string, any>
}

export default function BuilderMessageModal({ isOpen, onClose, context }: BuilderMessageModalProps) {
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      setMessage('')
      setSubmitted(false)
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!message.trim()) return

    setSubmitting(true)
    try {
      const res = await fetch('/api/message-to-builder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: message.trim(),
          context
        })
      })

      if (res.ok) {
        setSubmitted(true)
        setMessage('')
        // Auto close after 1.5s
        setTimeout(() => {
          setSubmitted(false)
          onClose()
        }, 1500)
      } else {
        console.error('Failed to send message')
      }
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-lg border border-gray-200 max-w-lg w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="text-center py-4">
            <p className="text-base text-gray-900 mb-2">
              ✅ Got it. Thanks — this helps me improve the tool.
            </p>
            <p className="text-sm text-gray-600">
              I don't reply individually, but I read every note.
            </p>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Send a note to the builder
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              I'm the person building Singapore Data Eye.
              <br />
              I read every message to understand where people get stuck.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-900 mb-2">
                  What's making this hard to decide?
                </label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="e.g. The area feels fine, but I'm unsure about long-term resale."
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  disabled={submitting}
                />
                <p className="mt-2 text-xs text-gray-500">
                  One sentence is enough.
                  <br />
                  No agents. No follow-up. Just context.
                </p>
              </div>

              <button
                type="submit"
                disabled={!message.trim() || submitting}
                className="w-full bg-gray-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? 'Sending...' : 'Send to builder'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
