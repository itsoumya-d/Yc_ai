'use server'

import OpenAI from 'openai'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function summarizePost(
  postId: string
): Promise<{ data?: string; error?: string }> {
  const supabase = await createClient()

  // Fetch the post
  const { data: post, error: fetchError } = await supabase
    .from('posts')
    .select('title, content, ai_summary')
    .eq('id', postId)
    .single()

  if (fetchError) return { error: fetchError.message }

  // Return existing summary if available
  if (post.ai_summary) {
    return { data: post.ai_summary }
  }

  if (!process.env.OPENAI_API_KEY) {
    return { error: 'AI summarization is not configured' }
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a helpful assistant that summarizes neighborhood community posts. Create concise, neutral summaries in 1-2 sentences that capture the key point of the post.',
        },
        {
          role: 'user',
          content: `Summarize this community post:\n\nTitle: ${post.title}\n\nContent: ${post.content}`,
        },
      ],
      max_tokens: 150,
      temperature: 0.3,
    })

    const summary = completion.choices[0]?.message?.content?.trim()

    if (!summary) {
      return { error: 'Failed to generate summary' }
    }

    // Save the summary
    const { error: updateError } = await supabase
      .from('posts')
      .update({ ai_summary: summary })
      .eq('id', postId)

    if (updateError) return { error: updateError.message }

    revalidatePath('/dashboard')
    revalidatePath('/posts')
    return { data: summary }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return { error: `AI service error: ${message}` }
  }
}

export async function generateMeetingAgenda(
  topics: string[]
): Promise<{ data?: string; error?: string }> {
  if (!process.env.OPENAI_API_KEY) {
    return { error: 'AI summarization is not configured' }
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a helpful assistant for neighborhood associations. Generate clear, structured meeting agendas in markdown format.',
        },
        {
          role: 'user',
          content: `Create a community meeting agenda for the following topics:\n${topics.map((t, i) => `${i + 1}. ${t}`).join('\n')}`,
        },
      ],
      max_tokens: 500,
      temperature: 0.5,
    })

    const agenda = completion.choices[0]?.message?.content?.trim()
    if (!agenda) return { error: 'Failed to generate agenda' }

    return { data: agenda }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return { error: `AI service error: ${message}` }
  }
}

export async function moderateContent(
  content: string
): Promise<{ data?: { safe: boolean; reason?: string }; error?: string }> {
  if (!process.env.OPENAI_API_KEY) {
    return { data: { safe: true } }
  }

  try {
    const moderation = await openai.moderations.create({
      input: content,
    })

    const result = moderation.results[0]
    if (!result) return { data: { safe: true } }

    return {
      data: {
        safe: !result.flagged,
        reason: result.flagged
          ? Object.entries(result.categories)
              .filter(([, flagged]) => flagged)
              .map(([cat]) => cat)
              .join(', ')
          : undefined,
      },
    }
  } catch (err) {
    // Don't block on moderation errors
    return { data: { safe: true } }
  }
}
