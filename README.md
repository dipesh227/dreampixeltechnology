# DreamPixel Technology - AI Content Creation Suite

![DreamPixel Logo](https://ai.dreampixeltechnology.in/logo.svg)

**Your Vision, Amplified by AI.**

DreamPixel is a powerful, all-in-one AI-powered content creation suite designed to help creators, marketers, and campaigners produce stunning visual content in seconds. It features a secure authentication system, user-specific data storage, and server-side encryption for sensitive information.

## ✨ Key Features

-   **Multiple Content Tools**:
    -   YouTube Thumbnail Generator
    -   Ad Banner Generator
    -   Politician's Poster Maker
-   **Secure Google Authentication**: Sign in to save and manage your creations securely.
-   **Database Encryption**: User-submitted prompts and feedback are encrypted at rest in the database using `pgsodium` for enhanced privacy.
-   **Flexible AI Provider Support**:
    -   Use the application's **default Google Gemini** provider.
    -   Integrate your own API keys for **Custom Gemini**, **OpenRouter**, and **OpenAI (GPT-4 & DALL-E 3)**.
-   **Live API Key Validation**: Instant feedback to confirm your API keys are valid.
-   **Interactive & Modern UI**: A vibrant, colorful UI with a neon mouse trail, glowing hover effects, and an animated background that synchronizes with AI generation tasks.
-   **Personalized History**: Like and save your favorite creations, stored securely and tied to your user account.

---

## 🛠️ Tech Stack

-   **Frontend**: React, TypeScript, Vite
-   **Styling**: Tailwind CSS
-   **AI APIs**: Google Gemini, OpenRouter, OpenAI
-   **Backend & Auth**: Supabase (Auth, PostgreSQL with `pgsodium` for encryption)
-   **Icons**: `react-icons`

---

## 🚀 Getting Started

Follow these instructions to set up and run the project locally.

### 1. Prerequisites

-   [Node.js](https://nodejs.org/) (v18.x or later)
-   A [Supabase](https://supabase.com/) account.
-   A [Google Cloud](https://console.cloud.google.com/) account for OAuth credentials.

### 2. Clone & Install

```bash
git clone https://github.com/your-username/dreampixel-ai.git
cd dreampixel-ai
npm install
```

### 3. Environment Variables

Create a `.env` file in the root of the project by copying the example:
```bash
cp .env.example .env
```
Now, open `.env` and add your credentials:

```env
# .env

# 1. Default Google Gemini API Key (for the 'Default' provider)
# Get from Google AI Studio: https://aistudio.google.com/
VITE_API_KEY="YOUR_GOOGLE_GEMINI_API_KEY"

# 2. Supabase Database Connection
# Get from your Supabase project settings -> API
VITE_SUPABASE_URL="YOUR_SUPABASE_URL"
VITE_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
```

### 4. Supabase Backend Setup (CRITICAL)

This step configures your database, authentication, and encryption.

1.  Navigate to your project on the [Supabase Dashboard](https://supabase.com/dashboard) and go to the **SQL Editor**.
2.  Click **+ New query** and paste the **entire script** below into the editor.
3.  Click **RUN**. This single script will set up everything you need.

<details>
<summary><strong>Click to view the Full Supabase Setup SQL Script</strong></summary>

```sql
/******************************************************************************
*  DREAMPIXEL TECHNOLOGY - SUPABASE DATABASE & ENCRYPTION SETUP SCRIPT
*
*  This script will:
*  1. Enable the required 'pgsodium' extension for encryption.
*  2. Create a secure vault for and store a new encryption key.
*  3. Create all required tables: `profiles`, `creations`, `feedback`,
*     and job logging tables.
*  4. Set up a trigger to automatically create a user profile on sign-up.
*  5. Create PostgreSQL functions (RPCs) to handle secure, server-side
*     encryption and decryption of user data.
*  6. Enable and configure Row Level Security (RLS) to ensure users can
*     only access their own data.
******************************************************************************/

-- Step 1: Enable the pgsodium extension for encryption
-- This only needs to be run once per database.
CREATE EXTENSION IF NOT EXISTS pgsodium WITH SCHEMA pgsodium;


-- Step 2: Create a secret key in the pgsodium vault
-- This key is used to encrypt and decrypt data. It is stored securely
-- and is not directly accessible. We associate it with a key_id for reference.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pgsodium.key WHERE name = 'dreampixel_user_data_key') THEN
    PERFORM pgsodium.create_key(
        name := 'dreampixel_user_data_key',
        key_type := 'aead-det'
    );
  END IF;
END $$;


-- Step 3: Create the core application tables
-- Profile table stores public user data and is linked to Supabase's auth system.
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT
);
COMMENT ON TABLE public.profiles IS 'Stores public profile information for each user.';

-- Creations table stores user-generated content.
-- The 'prompt' will be encrypted.
CREATE TABLE IF NOT EXISTS public.creations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  prompt BYTEA, -- Storing encrypted data as bytes
  image_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
COMMENT ON TABLE public.creations IS 'Stores liked creations with encrypted prompts.';

-- Feedback table stores user feedback.
-- The 'content' will be encrypted.
CREATE TABLE IF NOT EXISTS public.feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  content BYTEA, -- Storing encrypted data as bytes
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
COMMENT ON TABLE public.feedback IS 'Collects user feedback with encrypted content.';

-- Job Logging tables to store user inputs for generation tasks
CREATE TABLE IF NOT EXISTS public.thumbnail_generation_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  description TEXT,
  thumbnail_text TEXT,
  brand_details TEXT,
  style_id TEXT,
  aspect_ratio TEXT,
  headshot_filenames TEXT[]
);
COMMENT ON TABLE public.thumbnail_generation_jobs IS 'Logs all input parameters for a thumbnail generation job.';

CREATE TABLE IF NOT EXISTS public.political_poster_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  party_id TEXT,
  event_theme TEXT,
  custom_text TEXT,
  style_id TEXT,
  aspect_ratio TEXT,
  headshot_filename TEXT
);
COMMENT ON TABLE public.political_poster_jobs IS 'Logs all input parameters for a political poster job.';

CREATE TABLE IF NOT EXISTS public.ad_banner_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  product_description TEXT,
  headline TEXT,
  brand_details TEXT,
  style_id TEXT,
  aspect_ratio TEXT,
  product_image_filename TEXT,
  model_headshot_filename TEXT
);
COMMENT ON TABLE public.ad_banner_jobs IS 'Logs all input parameters for an ad banner job.';


-- Step 4: Automate profile creation for new users
-- This function and trigger automatically create a public profile when a user signs up.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- Step 5: Create Server-Side Functions (RPC) for Secure Data Handling
-- These functions handle encryption/decryption on the server, so the key is never exposed.

-- Get the ID of our encryption key
CREATE OR REPLACE FUNCTION get_key_id()
RETURNS UUID AS $$
DECLARE
  key_id UUID;
BEGIN
  SELECT id INTO key_id FROM pgsodium.key WHERE name = 'dreampixel_user_data_key' LIMIT 1;
  RETURN key_id;
END;
$$ LANGUAGE plpgsql;

-- Function to create an encrypted creation
CREATE OR REPLACE FUNCTION create_encrypted_creation(p_prompt TEXT, p_image_url TEXT, p_user_id UUID)
RETURNS void AS $$
BEGIN
  INSERT INTO public.creations (prompt, image_url, user_id)
  VALUES (
    pgsodium.crypto_aead_det_encrypt(
      convert_to(p_prompt, 'utf8'),
      '{}'::JSONB,
      get_key_id()
    ),
    p_image_url,
    p_user_id
  );
END;
$$ LANGUAGE plpgsql;

-- Function to get and decrypt a user's creations
CREATE OR REPLACE FUNCTION get_decrypted_creations(p_user_id UUID)
RETURNS TABLE(id UUID, prompt TEXT, image_url TEXT, created_at TIMESTAMPTZ) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    convert_from(
      pgsodium.crypto_aead_det_decrypt(
        c.prompt,
        '{}'::JSONB,
        get_key_id()
      ),
      'utf8'
    ) AS prompt,
    c.image_url,
    c.created_at
  FROM
    public.creations c
  WHERE
    c.user_id = p_user_id
  ORDER BY
    c.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to submit encrypted feedback
CREATE OR REPLACE FUNCTION submit_encrypted_feedback(p_content TEXT, p_user_id UUID)
RETURNS void AS $$
BEGIN
  INSERT INTO public.feedback (content, user_id)
  VALUES (
    pgsodium.crypto_aead_det_encrypt(
      convert_to(p_content, 'utf8'),
      '{}'::JSONB,
      get_key_id()
    ),
    p_user_id
  );
END;
$$ LANGUAGE plpgsql;


-- Step 6: Enable Row Level Security (RLS) on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.thumbnail_generation_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.political_poster_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_banner_jobs ENABLE ROW LEVEL SECURITY;


-- Step 7: Create Security Policies to protect user data
DROP POLICY IF EXISTS "Users can view their own profile." ON public.profiles;
CREATE POLICY "Users can view their own profile."
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can manage their own creations." ON public.creations;
CREATE POLICY "Users can manage their own creations."
  ON public.creations FOR ALL
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own feedback." ON public.feedback;
CREATE POLICY "Users can insert their own feedback."
  ON public.feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own thumbnail jobs." ON public.thumbnail_generation_jobs;
CREATE POLICY "Users can manage their own thumbnail jobs."
  ON public.thumbnail_generation_jobs FOR ALL
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own political poster jobs." ON public.political_poster_jobs;
CREATE POLICY "Users can manage their own political poster jobs."
  ON public.political_poster_jobs FOR ALL
  USING (auth.uid() = user_id);
  
DROP POLICY IF EXISTS "Users can manage their own ad banner jobs." ON public.ad_banner_jobs;
CREATE POLICY "Users can manage their own ad banner jobs."
  ON public.ad_banner_jobs FOR ALL
  USING (auth.uid() = user_id);

-- Make RPCs invokable by users
GRANT EXECUTE ON FUNCTION public.create_encrypted_creation(TEXT, TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_decrypted_creations(UUID) TO authenticated;
-- Allow both logged-in and anonymous users to submit feedback
GRANT EXECUTE ON FUNCTION public.submit_encrypted_feedback(TEXT, UUID) TO authenticated, anon;

```
</details>

### 5. Google Authentication Setup

1.  Go to your Supabase Project Dashboard -> **Authentication** -> **Providers**.
2.  Click on **Google** and enable it.
3.  Copy the **Redirect URI (Callback URL)**.
4.  Go to the [Google Cloud Console](https://console.cloud.google.com/), create a new project, then go to **APIs & Services -> Credentials**.
5.  Create an **OAuth 2.0 Client ID**, select "Web application", and paste the Supabase callback URL into the "Authorized redirect URIs" field.
6.  Copy the **Client ID** and **Client Secret** from Google Cloud back into the Supabase Google provider settings.
7.  Click **Save**.

### 6. Running the Development Server

```bash
npm run dev
```

The application should now be running locally, fully connected to your secure Supabase backend.
---
## 📄 License

This project is licensed under the MIT License.