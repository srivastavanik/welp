interface RedditPost {
  title: string;
  text: string;
  subreddit: string;
  flairName?: string;
}

interface RedditConfig {
  clientId: string;
  clientSecret: string;
  userAgent: string;
  username?: string;
  password?: string;
}

export class RedditService {
  private config: RedditConfig;
  private accessToken: string | null = null;

  constructor() {
    this.config = {
      clientId: process.env.NEXT_PUBLIC_REDDIT_CLIENT_ID || '',
      clientSecret: process.env.REDDIT_CLIENT_SECRET || '',
      userAgent: 'Welp:v1.0.0 (by /u/WelpApp)',
      username: process.env.REDDIT_USERNAME,
      password: process.env.REDDIT_PASSWORD
    };
  }

  // Get anonymous access token for posting
  private async getAccessToken(): Promise<string> {
    if (this.accessToken) {
      return this.accessToken;
    }

    try {
      const auth = btoa(`${this.config.clientId}:${this.config.clientSecret}`);

      // Determine which OAuth grant to use
      let body: string;
      if (this.config.username && this.config.password) {
        // Script app – resource-owner password grant
        const params = new URLSearchParams({
          grant_type: 'password',
          username: this.config.username,
          password: this.config.password,
          scope: 'submit flair'
        });
        body = params.toString();
      } else {
        // Fallback – app-only, limited scopes (may not allow submit)
        body = new URLSearchParams({
          grant_type: 'client_credentials',
          scope: 'submit'
        }).toString();
      }

      const response = await fetch('https://www.reddit.com/api/v1/access_token', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': this.config.userAgent
        },
        body
      });

      if (!response.ok) {
        throw new Error(`Reddit auth failed: ${response.status}`);
      }

      const data = await response.json();
      this.accessToken = data.access_token;

      // Token expires, so clear it after 50 minutes
      setTimeout(() => {
        this.accessToken = null;
      }, 50 * 60 * 1000);

      return this.accessToken as string;
    } catch (error) {
      console.error('Reddit authentication error:', error);
      throw new Error('Failed to authenticate with Reddit');
    }
  }

  // Post to Reddit
  async postToReddit(post: RedditPost): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      if (!this.config.clientId || !this.config.clientSecret) {
        throw new Error('Reddit API credentials not configured');
      }

      const token = await this.getAccessToken();

      const formData = new URLSearchParams({
        api_type: 'json',
        kind: 'self',
        sr: post.subreddit,
        title: post.title,
        text: post.text,
        resubmit: 'true',
      });

      // Include flair if provided
      if (post.flairName) {
        formData.append('flair_name', post.flairName);
      }

      // Helper to attempt post with basic exponential back-off for rate-limits
      const attemptSubmit = async (retry = 0): Promise<Response> => {
        const response = await fetch('https://oauth.reddit.com/api/submit', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': this.config.userAgent,
          },
          body: formData.toString(),
        });

        // Reddit uses 429 for rate-limit; backoff if encountered
        if (response.status === 429 && retry < 3) {
          const wait = (2 ** retry) * 1000 + Math.random() * 500; // jitter
          await new Promise((r) => setTimeout(r, wait));
          return attemptSubmit(retry + 1);
        }

        return response;
      };

      const response = await attemptSubmit();

      if (!response.ok) {
        throw new Error(`Reddit API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.json?.errors && data.json.errors.length > 0) {
        throw new Error(`Reddit error: ${data.json.errors[0][1]}`);
      }

      const postUrl = data.json?.data?.url;

      return {
        success: true,
        url: postUrl,
      };
    } catch (error) {
      console.error('Reddit posting error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // NEW: Fetch engagement metrics (score & comment count) for a post
  async getPostMetrics(permalink: string): Promise<{ score: number; numComments: number } | null> {
    try {
      const url = `https://www.reddit.com${permalink}.json`;
      const response = await fetch(url, {
        headers: { 'User-Agent': this.config.userAgent },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch metrics: ${response.status}`);
      }

      const data = await response.json();
      const postData = data?.[0]?.data?.children?.[0]?.data;
      if (!postData) return null;

      return {
        score: postData.score,
        numComments: postData.num_comments,
      };
    } catch (err) {
      console.error('Error fetching Reddit metrics', err);
      return null;
    }
  }

  // Generate post content based on review
  generatePostContent(review: {
    customerDisplayId: string;
    overallRating: number;
    comment: string;
    tags?: string[];
    reviewerRole: string;
  }): RedditPost {
    // Subreddit is fixed – set through env for flexibility
    const subreddit = process.env.NEXT_PUBLIC_REDDIT_SUBREDDIT || 'WelpAppReviews';

    const isPositive = review.overallRating >= 4.5;
    const isNegative = review.overallRating <= 1.5;

    // Anonymize for Reddit
    const anonymizedId = this.generateAnonymousId();

    // Generate catchy title
    let title: string;
    if (isPositive) {
      title = `⭐ ${review.overallRating}/5 – Customer of the Year? ${anonymizedId}`;
    } else if (isNegative) {
      title = `😱 ${review.overallRating}/5 – Absolute Nightmare: ${anonymizedId}`;
    } else {
      title = `${review.overallRating}/5 – Experience with ${anonymizedId}`;
    }

    // Build body text
    let text = `**Overall Rating:** ${review.overallRating}/5\n\n`;
    text += `**Story:**\n${review.comment}\n\n`;
    if (review.tags && review.tags.length > 0) {
      text += `**Tags:** ${review.tags.join(', ')}\n\n`;
    }
    text += `*Reviewer role:* ${review.reviewerRole}\n\n`;
    text += `*Posted via [Welp](https://welp.example.com) – the customer rating platform.*`;

    // Choose flair
    const flairName = isPositive ? 'Positive' : isNegative ? 'Negative' : 'Neutral';

    return {
      title,
      text,
      subreddit,
      flairName,
    };
  }

  // Generate anonymous ID for Reddit posts
  private generateAnonymousId(): string {
    const adjectives = ['Mysterious', 'Anonymous', 'Unknown', 'Random', 'Secret'];
    const nouns = ['Customer', 'Person', 'Individual', 'Patron', 'Client'];
    const numbers = Math.floor(Math.random() * 999) + 1;

    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];

    return `${adj} ${noun} #${numbers}`;
  }

  // Mock posting for development/testing
  async mockPostToReddit(post: RedditPost): Promise<{ success: boolean; url?: string; error?: string }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simulate success/failure (90% success rate)
    const success = Math.random() > 0.1;

    if (success) {
      const mockUrl = `https://reddit.com/r/${post.subreddit}/comments/mock123/${post.title.toLowerCase().replace(/\s+/g, '_')}`;
      return {
        success: true,
        url: mockUrl
      };
    } else {
      return {
        success: false,
        error: 'Mock Reddit API error for testing'
      };
    }
  }
}

export const redditService = new RedditService();