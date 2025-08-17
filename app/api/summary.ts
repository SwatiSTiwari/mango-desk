export interface Summary {
  title: string
  summary: string
  action_items: string[]
  risks: string[]
  follow_ups: string[]
}

export async function generateSummary(transcript: string, instruction: string): Promise<Summary> {
  const response = await fetch('/api/summary', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ transcript, instruction }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to generate summary')
  }

  return response.json()
}
