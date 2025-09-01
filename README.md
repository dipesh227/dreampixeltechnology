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

For authentication and data storage to work, you need to run several SQL scripts in your Supabase project.

1.  Navigate to your project on the [Supabase Dashboard](https://supabase.com/dashboard).
2.  In the left sidebar, go to the **SQL Editor**.
3.  Click **+ New query**.
4.  Copy and run the following SQL scripts one by one.

**Script 1: Create `profiles` Table and Trigger**
```sql
-- 1. Create the profiles table to store public user data
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT
);
-- Add a comment for clarity
COMMENT ON TABLE profiles IS 'Stores public profile information for each user.';

-- 2. Create a function to automatically insert a new profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create a trigger to execute the function on new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

**Script 2: Update Existing Tables**
```sql
-- 4. Add user_id columns to link creations and feedback to users
ALTER TABLE public.creations
  ADD COLUMN user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.feedback
  ADD COLUMN user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
```

**Script 3: Enable Row Level Security (RLS) & Create Policies**
```sql
-- 5. Enable Row Level Security (RLS) for data protection
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- 6. Create policies to control data access
-- Users can see their own profile
CREATE POLICY "Users can view their own profile."
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can insert, update, select, and delete their own creations
CREATE POLICY "Users can manage their own creations."
  ON public.creations FOR ALL
  USING (auth.uid() = user_id);

-- Users can insert their own feedback
CREATE POLICY "Users can insert feedback."
  ON public.feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

### 7. Running the Development Server

You are now ready to start the application.

```bash
npm run dev
```

The application should now be running on `http://localhost:5173`.
---
## 📄 License

This project is licensed under the MIT License.