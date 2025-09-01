# DreamPixel Technology - AI Content Creation Suite

This is an AI-powered content creation suite designed to generate high-quality visuals for various platforms, including YouTube thumbnails, advertisement banners, social media posts, and political posters. It leverages modern AI models to streamline the creative process.

## Key Features

- **YouTube Thumbnail Generator:** Creates click-worthy thumbnails from a headshot and video description.
- **Ad Banner Generator:** Produces professional ad banners for marketing campaigns.
- **Politician's Poster Maker:** Generates timely and impactful posters for political campaigns.
- **Flexible AI Providers:** Supports multiple AI backends, including Google Gemini (default), OpenRouter, and Perplexity, configurable via user settings.
- **Persistent History:** Saves "Liked Creations" to a Supabase backend, making them accessible across sessions.

## Local Development

To run this project locally, you'll need Node.js and npm (or a compatible package manager).

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <project-directory>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root of the project and add the necessary keys (see Production Setup section below).

4.  **Start the development server:**
    ```bash
    npm run dev
    ```

## Production Setup

To deploy this application or run it in a production environment, you must configure the following environment variables. These are typically set in your hosting provider's dashboard (e.g., Vercel, Netlify, or your server environment).

### 1. Default AI Provider API Key

The application uses Google Gemini as its default AI provider. An API key is required for the service to function out-of-the-box.

-   `API_KEY`: Your API key for the Google Gemini API.

### 2. Supabase Database Connection

The application uses Supabase for storing user data like "Liked Creations" and feedback submissions. You need to provide your Supabase project URL and the public `anon` key.

-   `VITE_SUPABASE_URL`: The URL of your Supabase project. You can find this in your Supabase project's "API" settings.
-   `VITE_SUPABASE_ANON_KEY`: Your Supabase project's `anon` (public) key. This key is safe to expose in a client-side application.

### Example Configuration

If you are using a `.env` file for local development, it should look like this:

```bash
# .env

# Default Google Gemini API Key
API_KEY="your_google_gemini_api_key_here"

# Supabase Project Credentials
VITE_SUPABASE_URL="https://your-project-id.supabase.co"
VITE_SUPABASE_ANON_KEY="your_supabase_anon_key_here"
```

**Important:** Never commit your `.env` file to version control. Ensure it is listed in your `.gitignore` file. For production, always use your hosting provider's system for managing environment variables.
