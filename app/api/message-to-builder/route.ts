/**
 * POST /api/message-to-builder
 * 
 * Sends a message to the builder with automatic context collection
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'
const builderEmail = process.env.BUILDER_EMAIL || 'eatfreshapple@gmail.com'
const resendApiKey = process.env.RESEND_API_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, context } = body

    // Validation
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Prepare context for email
    const contextText = formatContextForEmail(context)

    // Store in Supabase
    const { error: dbError } = await supabase
      .from('builder_messages')
      .insert({
        message: message.trim(),
        context: context || {},
        created_at: new Date().toISOString()
      })

    if (dbError) {
      console.error('Error storing message:', dbError)
      // Continue even if DB fails - we'll still try to send email
    }

    // Send email using Resend
    const emailContent = formatEmail(message.trim(), context)
    
    if (resendApiKey) {
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
      console.log('=== Builder Message (Resend not configured) ===')
      console.log('To:', builderEmail)
      console.log('Subject:', emailContent.subject)
      console.log('Body:', emailContent.body)
      console.log('===============================================')
      console.log('To enable email sending, set RESEND_API_KEY in environment variables')
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

function formatContextForEmail(context: Record<string, any>): string {
  if (!context || Object.keys(context).length === 0) {
    return 'No context available'
  }

  const parts: string[] = []
  
  if (context.page) parts.push(`- Page: ${context.page}`)
  if (context.neighbourhood) parts.push(`- Neighbourhood: ${context.neighbourhood}`)
  if (context.neighbourhood_id) parts.push(`- Neighbourhood ID: ${context.neighbourhood_id}`)
  if (context.flat_type) parts.push(`- Flat type: ${context.flat_type}`)
  if (context.price_range) parts.push(`- Price range: ${context.price_range}`)
  if (context.lease_bucket) parts.push(`- Lease: ${context.lease_bucket}`)
  if (context.mrt_access) parts.push(`- MRT: ${context.mrt_access}`)
  if (context.filters_used) {
    const filters = Array.isArray(context.filters_used) 
      ? context.filters_used.join(', ')
      : context.filters_used
    parts.push(`- Filters: ${filters}`)
  }
  if (context.time_on_page) parts.push(`- Time on page: ${context.time_on_page}`)
  if (context.comparing_neighbourhoods) {
    const comparing = Array.isArray(context.comparing_neighbourhoods)
      ? context.comparing_neighbourhoods.join(', ')
      : context.comparing_neighbourhoods
    parts.push(`- Comparing: ${comparing}`)
  }

  return parts.join('\n') || 'No context available'
}

function formatEmail(message: string, context: Record<string, any>): { subject: string; body: string } {
  const neighbourhoodName = context.neighbourhood || context.neighbourhood_id || 'Unknown'
  const flatType = context.flat_type || ''
  const subject = `[Singapore Data Eye] Note to builder – ${neighbourhoodName}${flatType ? ` (${flatType})` : ''}`

  const contextText = formatContextForEmail(context)

  const body = `A user sent a note to the builder.

Their words:
"${message}"

Context:
${contextText}
`

  return { subject, body }
}
