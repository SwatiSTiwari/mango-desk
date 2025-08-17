# AI-Powered Meeting Notes Summarizer & Sharer

A full-stack Next.js application that allows users to upload meeting transcripts, generate AI-powered summaries using Groq, and share them via email using Resend.

## Features

- **Upload Transcripts**: Accept .txt files or paste text directly
- **Custom Instructions**: Add specific prompts for AI summary generation
- **AI Summary Generation**: Uses Groq's Mixtral model for intelligent summarization
- **Editable Summaries**: Review and edit generated summaries before sharing
- **Email Sharing**: Send summaries to multiple recipients via Resend
- **Responsive Design**: Clean, functional interface optimized for productivity

## Tech Stack

- **Frontend**: Next.js 14 with React 18, TypeScript
- **Backend**: Next.js API routes
- **AI**: Groq API (Mixtral-8x7b-32768 model)
- **Email**: Resend API for reliable email delivery
- **Styling**: Custom CSS with responsive design
- **Deployment**: Vercel-ready

## Why This Stack?

- **Next.js**: Provides both frontend and backend in one framework, perfect for full-stack apps
- **Groq**: Fast, reliable AI inference with excellent performance
- **Resend**: Developer-friendly email API with high deliverability
- **TypeScript**: Type safety and better development experience
- **Vercel**: Seamless deployment and hosting for Next.js apps

## AI Integration

The application integrates with Groq's API using their official SDK:

- **Model**: Mixtral-8x7b-32768 (fast, accurate, cost-effective)
- **Prompt Engineering**: Structured prompts for consistent JSON output
- **Fallback Handling**: Graceful degradation when AI responses don't match expected format
- **Mock Mode**: Demo functionality when API keys aren't configured

## Email System

Uses Resend API for reliable email delivery:

- **Validation**: Email format validation before sending
- **Batch Processing**: Send to multiple recipients efficiently
- **Error Handling**: Detailed feedback on successful/failed deliveries
- **Mock Mode**: Console logging when API keys aren't configured

## Local Development

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd ai-meeting-summarizer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Variables**
   Create a `.env.local` file in the root directory:
   ```env
   GROQ_API_KEY=your_groq_api_key_here
   RESEND_API_KEY=your_resend_api_key_here
   RESEND_FROM_EMAIL=Meeting Summarizer <your-verified-email@domain.com>
   AI_PROVIDER=groq
   EMAIL_PROVIDER=resend
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### API Keys Setup

#### Groq API Key
1. Sign up at [groq.com](https://groq.com)
2. Navigate to API Keys section
3. Create a new API key
4. Add to your `.env.local` file

#### Resend API Key
1. Sign up at [resend.com](https://resend.com)
2. Verify your domain or use the sandbox domain
3. Create an API key
4. Add to your `.env.local` file

## Deployment

### Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy on Vercel**
   - Connect your GitHub repository to Vercel
   - Add environment variables in Vercel dashboard
   - Deploy automatically on push

3. **Environment Variables in Vercel**
   - `GROQ_API_KEY`: Your Groq API key
   - `RESEND_API_KEY`: Your Resend API key
   - `RESEND_FROM_EMAIL`: Your verified sender email

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Usage

1. **Upload Transcript**: Either upload a .txt file or paste text directly
2. **Add Instruction**: Provide specific guidance for AI summary generation
3. **Generate Summary**: Click the button to get AI-generated structured summary
4. **Edit Summary**: Review and modify the generated summary as needed
5. **Add Recipients**: Enter email addresses for sharing
6. **Send Email**: Share the edited summary with your team

## API Endpoints

### POST /api/summary
Generates AI summary from transcript and instruction.

**Request Body:**
```json
{
  "transcript": "Meeting transcript text...",
  "instruction": "Summarize in bullet points for executives"
}
```

**Response:**
```json
{
  "title": "Meeting Summary",
  "summary": "Brief summary text...",
  "action_items": ["Action 1", "Action 2"],
  "risks": ["Risk 1", "Risk 2"],
  "follow_ups": ["Follow-up 1", "Follow-up 2"]
}
```

### POST /api/email
Sends summary to specified recipients.

**Request Body:**
```json
{
  "recipients": ["email1@example.com", "email2@example.com"],
  "summary": "Summary content to send"
}
```

## Error Handling

The application includes comprehensive error handling:
- **API Key Validation**: Graceful fallbacks when keys are missing
- **Input Validation**: Client and server-side validation
- **Network Errors**: User-friendly error messages
- **Email Validation**: Format checking before sending

## Performance

- **AI Response Time**: Typically under 10 seconds
- **Email Delivery**: Near-instant via Resend
- **Bundle Size**: Optimized Next.js build
- **Caching**: Built-in Next.js optimizations

## Security

- **Environment Variables**: API keys stored securely
- **Input Sanitization**: Validation on all user inputs
- **Rate Limiting**: Consider adding for production use
- **CORS**: Configured for your deployment domain

## Troubleshooting

### Common Issues

1. **AI Summary Not Generating**
   - Check GROQ_API_KEY in environment variables
   - Verify Groq account has sufficient credits
   - Check browser console for errors

2. **Emails Not Sending**
   - Verify RESEND_API_KEY is set
   - Check Resend dashboard for delivery status
   - Ensure sender email is verified

3. **Build Errors**
   - Clear `.next` folder and node_modules
   - Run `npm install` again
   - Check TypeScript configuration

### Debug Mode

Enable debug logging by setting:
```env
DEBUG=true
NODE_ENV=development
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Create a GitHub issue
- Check the troubleshooting section
- Review environment variable configuration

## Roadmap

- [ ] Save past summaries to localStorage
- [ ] Download summaries as .txt/.json
- [ ] Basic authentication
- [ ] Multiple AI provider support
- [ ] Rich text editing for summaries
- [ ] Meeting template library
