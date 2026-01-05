/**
 * POST /api/feedback
 * 
 * Submits anonymous user feedback
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

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

    if (!context || !['affordability', 'compare', 'home', 'neighbourhood'].includes(context)) {
      return NextResponse.json(
        { error: 'Valid context is required (affordability, compare, home, or neighbourhood)' },
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
      return NextResponse.json(
        { error: 'Failed to submit feedback', details: error.message },
        { status: 500 }
      )
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

