/**
 * Base class for errors that are eligible for retries.
 * This allows the retry logic to catch various types of transient errors.
 */
export class RetriableError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'RetriableError';
    }
}


/**
 * Custom error for API rate limit issues (HTTP 429).
 * This allows for specific error handling, like retries with backoff.
 */
export class RateLimitError extends RetriableError {
    constructor(message: string) {
        super(message);
        this.name = 'RateLimitError';
    }
}
