import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'

// Only create Groq client if API key is available
let groq: any = null
if (process.env.GROQ_API_KEY) {
  try {
    groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    })
  } catch (error) {
    console.error('Failed to initialize Groq client:', error)
  }
}

export async function POST(request: NextRequest) {
  try {
    // Debug: Log environment variable status
    console.log('Environment check:', {
      hasGroqKey: !!process.env.GROQ_API_KEY,
      groqKeyLength: process.env.GROQ_API_KEY?.length || 0,
      groqClientExists: !!groq
    })
    
    const { transcript, instruction } = await request.json()

    if (!transcript || !instruction) {
      return NextResponse.json(
        { error: 'Transcript and instruction are required' },
        { status: 400 }
      )
    }

    if (!process.env.GROQ_API_KEY || !groq) {
      // Mock response for demo purposes when API key is missing
      return NextResponse.json({
        title: "Sample Meeting Summary",
        summary: "This is a mock summary generated when the Groq API key is not configured. Please add your GROQ_API_KEY to the environment variables.",
        action_items: [
          "Configure GROQ_API_KEY in environment variables",
          "Test the AI summary generation",
          "Review and edit the generated summary"
        ],
        risks: [
          "API key not configured",
          "Mock data being used"
        ],
        follow_ups: [
          "Set up proper API credentials",
          "Validate AI responses"
        ]
      })
    }

    const prompt = `Create a meeting summary in this exact JSON format. Do not add any text before or after the JSON:

{
  "title": "Q4 Planning Meeting",
  "summary": "Team discussed Q4 roadmap, progress on authentication module, UI design status, and testing requirements. Key decisions made on priorities and timelines.",
  "action_items": ["Sarah to complete authentication module by Dec 20", "Mike to deliver dashboard UI by Dec 18", "Lisa to create testing timeline by tomorrow"],
  "risks": ["Payment integration delayed to January", "Design system needs more implementation time", "Testing requires 2 weeks minimum"],
  "follow_ups": ["Weekly progress review meetings", "IT to check server resources for authentication"]
}

Based on this transcript: ${transcript}

Custom instruction: ${instruction}

Remember: Return ONLY the JSON, no other text.`

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a professional meeting summarizer. You must ALWAYS respond with ONLY valid JSON in the exact format requested. Never include explanatory text, markdown formatting, or any content outside the JSON structure."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "llama3-8b-8192",
      temperature: 0.1,
      max_tokens: 1000,
    })

    const response = completion.choices[0]?.message?.content

    if (!response) {
      throw new Error('No response from AI model')
    }

    // Try to parse JSON response
    try {
      // Clean up the response - remove any trailing incomplete content
      let cleanResponse = response.trim()
      
      // Find the last complete JSON object
      const lastBraceIndex = cleanResponse.lastIndexOf('}')
      if (lastBraceIndex !== -1) {
        cleanResponse = cleanResponse.substring(0, lastBraceIndex + 1)
      }
      
      // Try to find and extract JSON content
      const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        cleanResponse = jsonMatch[0]
      }
      
      const parsedResponse = JSON.parse(cleanResponse)
      
      // Validate and clean up the response
      const cleanedResponse = {
        title: parsedResponse.title || "Meeting Summary",
        summary: parsedResponse.summary || "AI-generated summary",
        // Keep only non-empty string items; use proper typing to avoid implicit 'any'
        action_items: Array.isArray(parsedResponse.action_items)
          ? parsedResponse.action_items.filter((item: unknown): item is string => typeof item === 'string' && item.trim().length > 0)
          : [],
        risks: Array.isArray(parsedResponse.risks)
          ? parsedResponse.risks.filter((item: unknown): item is string => typeof item === 'string' && item.trim().length > 0)
          : [],
        follow_ups: Array.isArray(parsedResponse.follow_ups)
          ? parsedResponse.follow_ups.filter((item: unknown): item is string => typeof item === 'string' && item.trim().length > 0)
          : []
      }
      
      // If arrays are empty, provide fallback content
      if (cleanedResponse.action_items.length === 0) {
        cleanedResponse.action_items = ["Review and edit the generated summary"]
      }
      if (cleanedResponse.risks.length === 0) {
        cleanedResponse.risks = ["No specific risks identified"]
      }
      if (cleanedResponse.follow_ups.length === 0) {
        cleanedResponse.follow_ups = ["Schedule follow-up meeting"]
      }
      
      return NextResponse.json(cleanedResponse)
      
    } catch (parseError) {
      // If JSON parsing fails, try to extract structured content from the text
      const lines = response.split('\n')
      const extractedData: {
        title: string,
        summary: string,
        action_items: string[],
        risks: string[],
        follow_ups: string[]
      } = {
        title: "Meeting Summary",
        summary: "",
        action_items: [],
        risks: [],
        follow_ups: []
      }
      
      let currentSection = ""
      for (const line of lines) {
        const trimmedLine = line.trim()
        if (trimmedLine.includes('"title"')) {
          const match = trimmedLine.match(/"title":\s*"([^"]+)"/)
          if (match) extractedData.title = match[1]
        } else if (trimmedLine.includes('"summary"')) {
          const match = trimmedLine.match(/"summary":\s*"([^"]+)"/)
          if (match) extractedData.summary = match[1]
        } else if (trimmedLine.includes('"action_items"')) {
          currentSection = "action_items"
        } else if (trimmedLine.includes('"risks"')) {
          currentSection = "risks"
        } else if (trimmedLine.includes('"follow_ups"')) {
          currentSection = "follow_ups"
        } else if (trimmedLine.includes('"task"') || trimmedLine.includes('"assignee"')) {
          const taskMatch = trimmedLine.match(/"task":\s*"([^"]+)"/)
          const assigneeMatch = trimmedLine.match(/"assignee":\s*"([^"]+)"/)
          if (taskMatch) {
            const task = taskMatch[1]
            const assignee = assigneeMatch ? assigneeMatch[1] : ""
            extractedData.action_items.push(assignee ? `${assignee}: ${task}` : task)
          }
        } else if (trimmedLine.includes('"risk"') || trimmedLine.includes('"dependency"')) {
          const riskMatch = trimmedLine.match(/"risk":\s*"([^"]+)"/)
          if (riskMatch) extractedData.risks.push(riskMatch[1])
        } else if (trimmedLine.includes('"follow_up"')) {
          const followUpMatch = trimmedLine.match(/"follow_up":\s*"([^"]+)"/)
          if (followUpMatch) extractedData.follow_ups.push(followUpMatch[1])
        }
      }
      
      // If we couldn't extract much, provide a clean fallback
      if (!extractedData.summary && extractedData.action_items.length === 0) {
        return NextResponse.json({
          title: "Meeting Summary",
          summary: "AI-generated summary (format may vary)",
          action_items: ["Review the generated summary", "Edit as needed"],
          risks: ["AI response format may vary"],
          follow_ups: ["Validate the summary content"]
        })
      }
      
      return NextResponse.json(extractedData)
    }

  } catch (error) {
    console.error('Error generating summary:', error)
    return NextResponse.json(
      { error: 'Failed to generate summary' },
      { status: 500 }
    )
  }
}
