/**
 * Custom error for API rate limit issues (HTTP 429).
 * This allows for specific error handling, like fallbacks.
 */
export class RateLimitError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'RateLimitError';
    }
}
