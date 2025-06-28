interface RedditPost {
  title: string;
  text: string;
  subreddit: string;
}

interface RedditConfig {
  clientId: string;
  clientSecret: string;
  userAgent: string;
}

export class RedditService {
  private config: RedditConfig;
  private accessToken: string | null = null;

  constructor() {
    this.config = {
      clientId: process.env.NEXT_PUBLIC_REDDIT_CLIENT_ID || '',
      clientSecret: process.env.REDDIT_CLIENT_SECRET || '',
      userAgent: 'Welp:v1.0.0 (by /u/WelpApp)'
    };
  }

  // Get anonymous access token for posting
  private async getAccessToken(): Promise<string> {
    if (this.accessToken) {
      return this.accessToken;
    }

    try {
      const auth = btoa(`${this.config.clientId}:${this.config.clientSecret}`);
      
      const response = await fetch('https://www.reddit.com/api/v1/access_token', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': this.config.userAgent
        },
        body: 'grant_type=client_credentials'
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

      return this.accessToken;
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
        resubmit: 'true'
      });

      const response = await fetch('https://oauth.reddit.com/api/submit', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': this.config.userAgent
        },
        body: formData.toString()
      });

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
        url: postUrl
      };
    } catch (error) {
      console.error('Reddit posting error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
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
    const isGoodCustomer = review.overallRating >= 3.5;
    const subreddit = isGoodCustomer ? 'CustomerFromHeaven' : 'CustomerFromHell';
    
    // Anonymize further for Reddit
    const anonymizedId = this.generateAnonymousId();
    
    let title: string;
    let text: string;

    if (isGoodCustomer) {
      title = `Amazing customer experience - ${anonymizedId}`;
      text = `Had an incredible customer today that I just had to share about!\n\n`;
      text += `**Rating: ${review.overallRating}/5 ⭐**\n\n`;
      text += `**What happened:**\n${review.comment}\n\n`;
      
      if (review.tags && review.tags.length > 0) {
        text += `**Why they were great:** ${review.tags.join(', ')}\n\n`;
      }
      
      text += `As a ${review.reviewerRole.toLowerCase()}, customers like this make the job worth it. We need more people like this in the world! 🙏\n\n`;
      text += `*Posted anonymously from Welp - the customer rating platform*`;
    } else {
      title = `Nightmare customer experience - ${anonymizedId}`;
      text = `Had to deal with a really difficult customer today. Need to vent...\n\n`;
      text += `**Rating: ${review.overallRating}/5 ⭐**\n\n`;
      text += `**What happened:**\n${review.comment}\n\n`;
      
      if (review.tags && review.tags.length > 0) {
        text += `**Red flags:** ${review.tags.join(', ')}\n\n`;
      }
      
      text += `As a ${review.reviewerRole.toLowerCase()}, dealing with customers like this is exhausting. Anyone else have similar experiences?\n\n`;
      text += `*Posted anonymously from Welp - the customer rating platform*`;
    }

    return {
      title,
      text,
      subreddit
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