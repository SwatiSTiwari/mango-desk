import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

// Only create Resend client if API key is available
let resend: any = null
if (process.env.RESEND_API_KEY) {
  try {
    resend = new Resend(process.env.RESEND_API_KEY)
  } catch (error) {
    console.error('Failed to initialize Resend client:', error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const { recipients, summary } = await request.json()

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json(
        { error: 'At least one recipient is required' },
        { status: 400 }
      )
    }

    if (!summary || typeof summary !== 'string') {
      return NextResponse.json(
        { error: 'Summary content is required' },
        { status: 400 }
      )
    }

    // Validate email format for all recipients
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const invalidEmails = recipients.filter(email => !emailRegex.test(email))
    
    if (invalidEmails.length > 0) {
      return NextResponse.json(
        { error: `Invalid email format: ${invalidEmails.join(', ')}` },
        { status: 400 }
      )
    }

    if (!process.env.RESEND_API_KEY || !resend) {
      // Mock response for demo purposes when API key is missing
      console.log('Mock email sending (RESEND_API_KEY not configured):')
      console.log('To:', recipients)
      console.log('Subject: Meeting Summary')
      console.log('Body:', summary)
      
      return NextResponse.json({
        message: 'Mock email sent successfully (RESEND_API_KEY not configured)',
        recipients,
        summary: summary.substring(0, 100) + '...'
      })
    }

    // Send email to all recipients
    const emailPromises = recipients.map(async (email) => {
      try {
        const { data, error } = await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || 'Meeting Summarizer <onboarding@resend.dev>',
          to: [email],
          subject: 'Meeting Summary',
          text: summary,
        })

        if (error) {
          throw new Error(error.message)
        }

        return { email, success: true, messageId: data?.id }
      } catch (error) {
        return { email, success: false, error: error instanceof Error ? error.message : 'Unknown error' }
      }
    })

    const results = await Promise.all(emailPromises)
    const successful = results.filter(r => r.success)
    const failed = results.filter(r => !r.success)

    if (failed.length > 0) {
      return NextResponse.json({
        message: `Email sent to ${successful.length} recipients, failed for ${failed.length}`,
        successful,
        failed
      }, { status: 207 }) // Multi-status response
    }

    return NextResponse.json({
      message: `Email sent successfully to ${successful.length} recipients`,
      successful
    })

  } catch (error) {
    console.error('Error sending email:', error)
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    )
  }
}
