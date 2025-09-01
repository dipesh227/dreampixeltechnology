# DreamPixel Technology - AI Content Creation Suite

![DreamPixel Logo](https://ai.dreampixeltechnology.in/logo.svg)

**Your Vision, Amplified by AI.**

DreamPixel is a powerful, all-in-one AI-powered content creation suite designed to help creators, marketers, and campaigners produce stunning visual content in seconds. Generate high-impact YouTube thumbnails, professional ad banners, and timely political posters with ease.

## ✨ Key Features

-   **Multiple Content Tools**:
    -   **YouTube Thumbnail Generator**: Create click-worthy thumbnails by emulating popular creator styles.
    -   **Ad Banner Generator**: Produce professional ad banners in various aspect ratios using proven marketing styles.
    -   **Politician's Poster Maker**: Generate impactful posters for political campaigns based on specific themes and party branding.
-   **Secure User Authentication**: Sign in with your Google account to save and manage your creations.
-   **Flexible AI Provider Support**:
    -   Use the application's **default Google Gemini** provider out-of-the-box.
    -   Integrate your own API keys for **Custom Gemini**, **OpenRouter**, and **OpenAI (GPT-4 & DALL-E 3)**.
-   **Live API Key Validation**: Instant feedback in the settings modal to confirm your API keys are valid.
-   **Interactive & Modern UI**:
    -   A vibrant, colorful UI with a "glassmorphism" aesthetic.
    -   An interactive neon mouse trail and glowing hover effects.
    -   An animated background that synchronizes with AI generation tasks for beautiful visual feedback.
-   **Personalized History**: Like and save your favorite creations, which are stored securely and tied to your user account in a Supabase database.
-   **Advanced AI Prompt Engineering**: Sophisticated, multi-step prompt generation ensures high-quality, relevant, and creative outputs.

---

## 🛠️ Tech Stack

-   **Frontend**: React, TypeScript, Vite
-   **Styling**: Tailwind CSS
-   **AI APIs**:
    -   Google Gemini API (`@google/genai`)
    -   OpenRouter API
    -   OpenAI API (GPT-4 Turbo & DALL-E 3)
-   **Backend & Auth**: Supabase (Auth, PostgreSQL)
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

# 2. Supabase Database Connection (Required for auth, saving/loading creations)
# Create a project on https://supabase.com/ to get your credentials.
VITE_SUPABASE_URL="YOUR_SUPABASE_URL"
VITE_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
```

### 5. Supabase Authentication Setup

You must enable Google as an authentication provider in your Supabase project.

1.  Go to your Supabase Project Dashboard.
2.  Navigate to **Authentication** -> **Providers**.
3.  Click on **Google** and enable it.
4.  You will see a **Redirect URI (Callback URL)**. Copy this URL.
5.  Go to the [Google Cloud Console](https://console.cloud.google.com/), create a new project, then go to **APIs & Services -> Credentials**.
6.  Create an **OAuth 2.0 Client ID**, select "Web application", and paste the Supabase callback URL into the "Authorized redirect URIs" field.
7.  Copy the **Client ID** and **Client Secret** from Google Cloud back into the Supabase Google provider settings.
8.  Click **Save**.

### 6. Supabase Database Setup

For authentication and data storage to work, you need to configure your Supabase database schema.

1.  Navigate to your project on the [Supabase Dashboard](https://supabase.com/dashboard) and go to the **SQL Editor**.
2.  You will need to create three core tables: `profiles`, `creations`, and `feedback`.
3.  **Profiles Table**: This table should store public user information and be linked to `auth.users` via a foreign key relationship on the user's `id`.
4.  **Database Trigger**: Create a trigger and function that automatically inserts a new row into your `profiles` table whenever a new user signs up in `auth.users`.
5.  **Link Tables**: Add a `user_id` foreign key column to your `creations` and `feedback` tables that references the `profiles` table.
6.  **Enable Row Level Security (RLS)**: This is a critical security step.
    -   Enable RLS on all three tables (`profiles`, `creations`, `feedback`).
    -   Create security policies to ensure that users can only access and manage their own data. For example, a user should only be able to `SELECT` their own profile and perform `ALL` actions on their own `creations`.

### 7. Running the Development Server

You are now ready to start the application.

```bash
npm run dev
```

The application should now be running on `http://localhost:5173`.
---
## 📄 License

This project is licensed under the MIT License.