
# DreamPixel Technology - AI Content Creation Suite

![DreamPixel Logo](https://ai.dreampixeltechnology.in/logo.svg)

**Your Vision, Amplified by AI.**

DreamPixel is a powerful, all-in-one AI-powered content creation suite designed to help creators, marketers, and campaigners produce stunning visual content in seconds. Generate high-impact YouTube thumbnails, professional ad banners, and timely political posters with ease.

## ✨ Key Features

-   **Multiple Content Tools**:
    -   **YouTube Thumbnail Generator**: Create click-worthy thumbnails by emulating popular creator styles.
    -   **Ad Banner Generator**: Produce professional ad banners in various aspect ratios using proven marketing styles.
    -   **Politician's Poster Maker**: Generate impactful posters for political campaigns based on specific themes and party branding.
-   **Flexible AI Provider Support**:
    -   Use the application's **default Google Gemini** provider out-of-the-box.
    -   Integrate your own API keys for **Custom Gemini**, **OpenRouter**, and **OpenAI (GPT-4 & DALL-E 3)**.
-   **Live API Key Validation**: Instant feedback in the settings modal to confirm your API keys are valid.
-   **Interactive & Modern UI**:
    -   A vibrant, colorful UI with a "glassmorphism" aesthetic.
    -   An interactive neon mouse trail and glowing hover effects.
    -   An animated background that synchronizes with AI generation tasks for beautiful visual feedback.
-   **Persistent History**: Like and save your favorite creations, which are stored securely in a Supabase database.
-   **Advanced AI Prompt Engineering**: Sophisticated, multi-step prompt generation ensures high-quality, relevant, and creative outputs.

---

## 🛠️ Tech Stack

-   **Frontend**: React, TypeScript, Vite
-   **Styling**: Tailwind CSS
-   **AI APIs**:
    -   Google Gemini API (`@google/genai`)
    -   OpenRouter API
    -   OpenAI API (GPT-4 Turbo & DALL-E 3)
-   **Database**: Supabase (PostgreSQL)
-   **Icons**: `react-icons`

---

## 🚀 Getting Started

Follow these instructions to set up and run the project locally.

### 1. Prerequisites

-   [Node.js](https://nodejs.org/) (v18.x or later recommended)
-   [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### 2. Clone the Repository

```bash
git clone https://github.com/your-username/dreampixel-ai.git
cd dreampixel-ai
```

### 3. Install Dependencies

```bash
npm install
```
or
```bash
yarn install
```

### 4. Environment Variables Setup

This is the most critical step. The application requires API keys and database credentials to function correctly.

Create a `.env` file in the root of the project by copying the example file:
```bash
cp .env.example .env
```

Now, open the `.env` file and add your credentials.

```env
# .env

# 1. Default Google Gemini API Key (Required for the 'Default' provider)
# Get your key from Google AI Studio: https://aistudio.google.com/
VITE_API_KEY="YOUR_GOOGLE_GEMINI_API_KEY"

# 2. Supabase Database Connection (Required for saving/loading creations)
# Create a project on https://supabase.com/ to get your credentials.
VITE_SUPABASE_URL="YOUR_SUPABASE_PROJECT_URL"
VITE_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
```

**Note**: The custom API keys for Gemini, OpenRouter, and OpenAI are managed through the application's "API Settings" modal and stored in your browser's local storage; they are not set in the `.env` file.

### 5. Supabase Database Setup

For the "Liked Creations" and "Feedback" features to work, you need to create two tables in your Supabase project.

1.  Navigate to your project on the [Supabase Dashboard](https://supabase.com/dashboard).
2.  In the left sidebar, go to the **SQL Editor**.
3.  Click **+ New query**.
4.  Copy and run the following SQL scripts one by one.

**Table 1: `creations`**
```sql
-- Creates the table to store all generated and liked creations.
CREATE TABLE creations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt TEXT NOT NULL,
  image_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Add a descriptive comment for clarity within your database schema.
COMMENT ON TABLE creations IS 'Stores liked creations, including the prompt and the resulting image URL.';
```

**Table 2: `feedback`**
```sql
-- Creates the table for user-submitted feedback.
CREATE TABLE feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Add a descriptive comment.
COMMENT ON TABLE feedback IS 'Collects user feedback submitted through the application''s feedback modal.';
```

Once these tables are created, your application is fully configured to connect to your database.

### 6. Running the Development Server

You are now ready to start the application.

```bash
npm run dev
```

The application should now be running on `http://localhost:5173` (or another port if 5173 is in use).

### 7. Building for Production

To create an optimized production build:

```bash
npm run build
```

This will generate a `dist` directory with the static files for deployment.

---

## Usage

1.  **Select a Tool**: From the landing page, choose one of the available content creation tools.
2.  **Configure API (Optional)**: Click the **API Settings** button in the header to switch between the default provider or add your own custom API keys for Gemini, OpenRouter, or OpenAI. The status indicator will provide live feedback on your key's validity.
3.  **Provide Inputs**: Fill in the required fields for the selected tool (e.g., upload headshots, enter descriptions, choose styles).
4.  **Generate Concepts**: The AI will generate several creative concepts or prompts for you to choose from.
5.  **Generate Final Image**: Select your favorite concept to generate the final high-resolution image.
6.  **Like & Save**: If you like the result, click the "Like & Save" button to store it in your history, which is accessible from the sidebar on the landing page.

---
## 📄 License

This project is licensed under the MIT License. See the `LICENSE` file for details.
