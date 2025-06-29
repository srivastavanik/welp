import { NextRequest, NextResponse } from 'next/server'
import { redditService } from '@/lib/reddit'

// Helper: convert numeric rating to star emojis (rounded to nearest half star not required here)
function stars(rating: number) {
    const full = Math.round(rating)
    return '⭐'.repeat(full) + ` (${rating}/5)`
}

// Helper: call OpenAI to generate a catchy title
async function generateCatchyTitle(params: {
    rating: number
    tags?: string[]
    comment: string
}) {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
        // Fallback to default title if key missing
        return `${params.rating}/5 Customer Review`
    }

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: 'gpt-4.1-nano',
                messages: [
                    {
                        role: 'system',
                        content:
                            'You generate catchy, 1-sentence Reddit post titles for customer reviews. The user is some kind of service worker, and they will give you their review on a particular customer experience. Be funny and clickbaity. You can get fucking mad if they pissed you tf off. Do NOT exceed 120 characters, but do not cut off the sentence (should be complete). Do NOT put quotes around it. You do not have to summarize literally everything in the post, just make the best possible funny clickbait angry title.',
                    },
                    {
                        role: 'user',
                        content: `Rating: ${params.rating}/5\nTags: ${(params.tags || []).join(', ')}\nComment: ${params.comment}`,
                    },
                ],
                temperature: 0.9,
                max_tokens: 32,
            }),
        })

        if (!response.ok) {
            throw new Error(`OpenAI error ${response.status}`)
        }

        const data = await response.json()
        const title = data.choices?.[0]?.message?.content?.trim()
        return title || `${params.rating}/5 Customer Review`
    } catch (err) {
        console.error('OpenAI title generation failed', err)
        return `${params.rating}/5 Customer Review`
    }
}

// POST /api/reddit
export async function POST(req: NextRequest) {
    try {
        console.log('🔔 Reddit POST endpoint hit')
        const json = await req.json()

        // Validate minimal shape
        const {
            customerDisplayId,
            overallRating,
            comment,
            tags,
            reviewerRole,
        } = json || {}

        if (!customerDisplayId || typeof overallRating !== 'number' || !comment) {
            return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
        }

        console.log('Payload:', json)

        // Generate catchy AI title
        const title = await generateCatchyTitle({
            rating: overallRating,
            tags,
            comment,
        })

        // Build self-text body with star visuals
        const bodyText = `${stars(overallRating)}\n\n${comment}`

        const postContent = {
            title,
            text: bodyText,
            subreddit: process.env.NEXT_PUBLIC_REDDIT_SUBREDDIT || 'WelpAppReviews',
        }

        console.log('Post content for Reddit:', postContent)

        console.log('Posting to Reddit via live API')
        const result = await redditService.postToReddit(postContent as any)

        console.log('Reddit service result:', result)
        if (!result.success) {
            return NextResponse.json({ success: false, error: result.error }, { status: 500 })
        }

        return NextResponse.json({ success: true, url: result.url })
    } catch (err) {
        console.error('Reddit API route error', err)
        return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
    }
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const permalink = searchParams.get('permalink')
    if (!permalink) {
        return NextResponse.json({ error: 'permalink query param required' }, { status: 400 })
    }
    const metrics = await redditService.getPostMetrics(permalink)
    if (!metrics) {
        return NextResponse.json({ error: 'Failed to fetch metrics' }, { status: 500 })
    }
    return NextResponse.json({ success: true, metrics })
} 