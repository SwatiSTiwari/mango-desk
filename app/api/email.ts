export async function sendEmail(recipients: string[], summary: string): Promise<any> {
  const response = await fetch('/api/email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ recipients, summary }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to send email')
  }

  return response.json()
}
