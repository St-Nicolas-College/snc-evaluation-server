import OpenAI from 'openai'
import { parse } from 'path'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export type SentimentResult = {
  sentiment: 'Positive' | 'Neutral' | 'Negative'
  score: number
  summary: string
  suggestion: string
  keywords: string[]
}

function extractJson(text: string) {
  return text
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim()
}

export async function analyzeFeedbackSentiment(
  comment?: string
): Promise<SentimentResult> {
  if (!comment || !comment.trim()) {
    return {
      sentiment: 'Neutral',
      score: 0,
      summary: 'No feedback comment provided.',
      suggestion: 'No suggestion provided',
      keywords: []
    }
  }

  try {
    const response = await openai.responses.create({
      model: 'gpt-5.4',
      input: `
Analyze this student feedback for a faculty evaluation.

Return ONLY raw JSON.
Do not use markdown.
Do not wrap the answer in \`\`\`.

Format:
{
  "sentiment": "Positive",
  "score": 0.8,
  "summary": "short explanation",
  "suggestion: "Improved actionable suggestion",
  "keywords": ["keyword1", "keyword2"]
}

Feedback:
"${comment}"
      `
    })

    const rawText = response.output_text || ''
    const cleanText = extractJson(rawText)

    const parsed = JSON.parse(cleanText)

    return {
      sentiment: ['Positive', 'Neutral', 'Negative'].includes(parsed.sentiment)
        ? parsed.sentiment
        : 'Neutral',
      score: typeof parsed.score === 'number' ? parsed.score : 0,
      summary: parsed.summary || '',
      suggestion: parsed.suggestion,
      keywords: Array.isArray(parsed.keywords) ? parsed.keywords : []
    }
  } catch (error) {
    console.error('OpenAI sentiment analysis error:', error)

    return {
      sentiment: 'Neutral',
      score: 0,
      summary: 'Sentiment analysis failed.',
      suggestion: 'Sentiment analysis failed',
      keywords: []
    }
  }
}