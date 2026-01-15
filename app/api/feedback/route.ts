/**
 * POST /api/feedback
 * 
 * Submits anonymous user feedback
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'
const builderEmail = process.env.BUILDER_EMAIL
const resendApiKey = process.env.RESEND_API_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { feedback_text, context, metadata } = body

    // Validation
    if (!feedback_text || typeof feedback_text !== 'string' || feedback_text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Feedback text is required' },
        { status: 400 }
      )
    }

    if (!context || !['compare', 'home', 'neighbourhood'].includes(context)) {
      return NextResponse.json(
        { error: 'Valid context is required (compare, home, or neighbourhood)' },
        { status: 400 }
      )
    }

    // Limit feedback length (one/two lines, max 500 chars)
    if (feedback_text.length > 500) {
      return NextResponse.json(
        { error: 'Feedback is too long. Please keep it to one or two sentences.' },
        { status: 400 }
      )
    }

    // Insert feedback
    const { error } = await supabase
      .from('user_feedback')
      .insert({
        feedback_text: feedback_text.trim(),
        context,
        metadata: metadata || null
      })

    if (error) {
      console.error('Error inserting feedback:', error)
      // Continue even if DB fails - we'll still try to send email
    }

    // Send email using Resend
    const emailContent = formatFeedbackEmail(feedback_text.trim(), context, metadata)
    
    if (resendApiKey && builderEmail) {
      try {
        const resendResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Singapore Data Eye <onboarding@resend.dev>',
            to: [builderEmail],
            subject: emailContent.subject,
            text: emailContent.body,
          }),
        })

        if (!resendResponse.ok) {
          const errorData = await resendResponse.json()
          console.error('Resend API error:', errorData)
          // Continue even if email fails - message is still stored in DB
        }
      } catch (emailError) {
        console.error('Error sending email:', emailError)
        // Continue even if email fails - message is still stored in DB
      }
    } else {
      // Fallback: log email content if Resend is not configured
      if (!resendApiKey) {
        console.log('=== User Feedback (Resend not configured) ===')
        console.log('To enable email sending, set RESEND_API_KEY in environment variables')
      }
      if (!builderEmail) {
        console.log('=== User Feedback (BUILDER_EMAIL not configured) ===')
        console.log('To enable email sending, set BUILDER_EMAIL in environment variables')
      }
      if (builderEmail) {
        console.log('To:', builderEmail)
      }
      console.log('Subject:', emailContent.subject)
      console.log('Body:', emailContent.body)
      console.log('===============================================')
    }

    // Return success (no promise of reply, just acknowledgment)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

function formatFeedbackEmail(feedbackText: string, context: string, metadata?: Record<string, any>): { subject: string; body: string } {
  const contextLabel = context === 'home' ? 'Home' : context === 'neighbourhood' ? 'Neighbourhood' : context === 'compare' ? 'Compare' : 'Unknown'
  const subject = `[Singapore Data Eye] User Feedback – ${contextLabel}`

  let metadataText = ''
  if (metadata) {
    const parts: string[] = []
    if (metadata.neighbourhood_id) parts.push(`- Neighbourhood ID: ${metadata.neighbourhood_id}`)
    if (metadata.neighbourhood_name) parts.push(`- Neighbourhood: ${metadata.neighbourhood_name}`)
    if (parts.length > 0) {
      metadataText = `\nMetadata:\n${parts.join('\n')}\n`
    }
  }

  const body = `A user submitted feedback.

Context: ${contextLabel}

Their feedback:
"${feedbackText}"
${metadataText}
---
This feedback is anonymous and used only to improve guidance.`
  
  return { subject, body }
}
