'use client'

import { useState, useRef } from 'react'
import { generateSummary } from './api/summary'
import { sendEmail } from './api/email'

interface Summary {
  title: string
  summary: string
  action_items: string[]
  risks: string[]
  follow_ups: string[]
}

export default function Home() {
  const [transcript, setTranscript] = useState('')
  const [instruction, setInstruction] = useState('')
  const [summary, setSummary] = useState<Summary | null>(null)
  const [editedSummary, setEditedSummary] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [recipients, setRecipients] = useState<string[]>([])
  const [newRecipient, setNewRecipient] = useState('')
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'File too large. Please select a file smaller than 5MB.' })
        return
      }
      
      if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const content = e.target?.result as string
          setTranscript(content)
          setMessage({ type: 'success', text: `File "${file.name}" loaded successfully!` })
          // Clear the file input so the same file can be selected again
          if (fileInputRef.current) {
            fileInputRef.current.value = ''
          }
        }
        reader.onerror = () => {
          setMessage({ type: 'error', text: 'Failed to read the file. Please try again.' })
        }
        reader.readAsText(file)
      } else {
        setMessage({ type: 'error', text: 'Please select a .txt file only.' })
      }
    }
  }

  const handleGenerateSummary = async () => {
    if (!transcript.trim() || !instruction.trim()) {
      setMessage({ type: 'error', text: 'Please provide both transcript and instruction' })
      return
    }

    setIsGenerating(true)
    setMessage(null)

    try {
      const result = await generateSummary(transcript, instruction)
      setSummary(result)
      setEditedSummary(JSON.stringify(result, null, 2))
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to generate summary. Please try again.' })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSendEmail = async () => {
    if (!editedSummary.trim() || recipients.length === 0) {
      setMessage({ type: 'error', text: 'Please provide both summary and recipients' })
      return
    }

    setIsSending(true)
    setMessage(null)

    try {
      await sendEmail(recipients, editedSummary)
      setMessage({ type: 'success', text: 'Email sent successfully!' })
      setRecipients([])
      setNewRecipient('')
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to send email. Please try again.' })
    } finally {
      setIsSending(false)
    }
  }

  const addRecipient = () => {
    if (newRecipient.trim() && !recipients.includes(newRecipient.trim())) {
      setRecipients([...recipients, newRecipient.trim()])
      setNewRecipient('')
    }
  }

  const removeRecipient = (email: string) => {
    setRecipients(recipients.filter(r => r !== email))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addRecipient()
    }
  }

  return (
    <div className="container">
      <h1>AI Meeting Notes Summarizer</h1>

      {message && (
        <div className={message.type === 'success' ? 'success' : 'error'}>
          {message.text}
        </div>
      )}

      {/* Transcript Upload */}
      <div className="form-group">
        <label>Upload Transcript (.txt file) or Paste Text</label>
        <div 
          className="upload-area" 
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault()
            e.currentTarget.classList.add('dragover')
          }}
          onDragLeave={(e) => {
            e.preventDefault()
            e.currentTarget.classList.remove('dragover')
          }}
          onDrop={(e) => {
            e.preventDefault()
            e.currentTarget.classList.remove('dragover')
            const files = e.dataTransfer.files
            if (files.length > 0) {
              const file = files[0]
              if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
                const reader = new FileReader()
                reader.onload = (e) => {
                  const content = e.target?.result as string
                  setTranscript(content)
                }
                reader.readAsText(file)
              } else {
                setMessage({ type: 'error', text: 'Please drop a .txt file only.' })
              }
            }
          }}
        >
          <p>📁 Click to upload .txt file or drag & drop here</p>
          <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
            Supported: .txt files only
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
        </div>
        <div style={{ marginTop: '10px', textAlign: 'center', color: '#666' }}>
          <strong>OR</strong>
        </div>
        <div style={{ position: 'relative' }}>
          <textarea
            placeholder="Paste your transcript here..."
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
          />
          {transcript && (
            <button
              onClick={() => setTranscript('')}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '4px 8px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Custom Instruction */}
      <div className="form-group">
        <label>Custom Instruction / Prompt</label>
        <input
          type="text"
          placeholder="e.g., Summarize in bullet points for executives, Highlight only action items"
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
        />
      </div>

      {/* Generate Summary Button */}
      <div className="form-group">
        <button 
          onClick={handleGenerateSummary} 
          disabled={isGenerating || !transcript.trim() || !instruction.trim()}
        >
          {isGenerating ? 'Generating...' : 'Generate Summary'}
        </button>
      </div>

      {/* Generated Summary */}
      {summary && (
        <div className="summary-section">
          <h3>Generated Summary</h3>
          <div className="form-group">
            <label>Edit Summary (JSON format)</label>
            <textarea
              value={editedSummary}
              onChange={(e) => setEditedSummary(e.target.value)}
              style={{ minHeight: '200px' }}
            />
          </div>
        </div>
      )}

      {/* Email Section */}
      {summary && (
        <div className="email-section">
          <h3>Share via Email</h3>
          
          <div className="form-group">
            <label>Add Recipients</label>
            <div className="recipient-input">
              <input
                type="email"
                placeholder="Enter email address"
                value={newRecipient}
                onChange={(e) => setNewRecipient(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <button onClick={addRecipient}>Add</button>
            </div>
          </div>

          {recipients.length > 0 && (
            <div className="form-group">
              <label>Recipients:</label>
              <div className="recipients-list">
                {recipients.map((email, index) => (
                  <span key={index} className="recipient-tag">
                    {email}
                    <button onClick={() => removeRecipient(email)}>×</button>
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="form-group">
            <button 
              onClick={handleSendEmail} 
              disabled={isSending || recipients.length === 0 || !editedSummary.trim()}
            >
              {isSending ? 'Sending...' : 'Send Email'}
            </button>
          </div>
        </div>
      )}

      {/* API Key Status */}
      <div style={{ marginTop: '30px', padding: '15px', background: '#f0f0f0', borderRadius: '4px', fontSize: '14px' }}>
        <strong>Status:</strong> API keys are configured on the backend. The application will work with mock responses if keys are missing.
      </div>
    </div>
  )
}
