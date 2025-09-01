# DreamPixel Technology - AI Content Creation Suite

![DreamPixel Logo](https://ai.dreampixeltechnology.in/logo.svg)

**Your Vision, Amplified by AI.**

DreamPixel is a powerful, all-in-one AI-powered content creation suite designed to help creators, marketers, and campaigners produce stunning visual content in seconds. It features a secure authentication system, user-specific data storage, and server-side encryption for sensitive information.

## ✨ Key Features

-   **Multiple Content Tools**:
    -   YouTube Thumbnail Generator
    -   Ad Banner Generator
    -   Social Media Post Generator
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

## 📄 Database Schema

For reference, here is the schema for the tables created by the setup script. The script handles encryption by storing sensitive fields like `prompt` and `content` as `BYTEA` (byte array).

<details>
<summary><strong>profiles</strong> - Stores public user data.</summary>

```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT
);
```
</details>

<details>
<summary><strong>creations</strong> - Stores liked creations with encrypted prompts.</summary>

```sql
CREATE TABLE public.creations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  prompt BYTEA, -- Storing encrypted data as bytes
  image_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
```
</details>

<details>
<summary><strong>feedback</strong> - Collects user feedback with encrypted content.</summary>

```sql
CREATE TABLE public.feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  content BYTEA, -- Storing encrypted data as bytes
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
```
</details>

<details>
<summary><strong>thumbnail_generation_jobs</strong> - Logs inputs for thumbnail generation.</summary>

```sql
CREATE TABLE public.thumbnail_generation_jobs (
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
```
</details>

<details>
<summary><strong>political_poster_jobs</strong> - Logs inputs for political poster generation.</summary>

```sql
CREATE TABLE public.political_poster_jobs (
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
```
</details>

<details>
<summary><strong>ad_banner_jobs</strong> - Logs inputs for ad banner generation.</summary>

```sql
CREATE TABLE public.ad_banner_jobs (
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
```
</details>

<details>
<summary><strong>social_media_post_jobs</strong> - Logs inputs for social media post generation.</summary>

```sql
CREATE TABLE public.social_media_post_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  topic TEXT,
  platform TEXT,
  tone TEXT,
  call_to_action TEXT,
  style_id TEXT,
  aspect_ratio TEXT
);
```
</details>

---

## 🚀 Getting Started

Follow these instructions to set up and run the project locally.

### 1. Prerequisites

-   [Node.js](https://nodejs.org/) (v18.x or later)
-   A [Supabase](https://supabase.com/) account (the free tier is sufficient).
-   A [Google Cloud](https://console.cloud.google.com/) account for setting up OAuth.

### 2. Clone the Repository

Clone the project to your local machine:
```bash
git clone <repository_url>
cd <repository_directory>
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Set Up Environment Variables

This application requires a `.env` file for Supabase credentials.

1.  Create a file named `.env` in the root of the project.
2.  Add the following content to it:

    ```env
    VITE_SUPABASE_URL="YOUR_SUPABASE_URL"
    VITE_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
    ```

3.  Find these values in your Supabase project dashboard under **Project Settings > API**.
4.  Copy the **Project URL** and the **`anon` public key** and paste them into your `.env` file.

### 5. Set Up Supabase Database

The database requires several tables, row-level security (RLS) policies, and server-side functions for handling user data and encryption.

1.  Navigate to your Supabase project dashboard.
2.  Go to the **SQL Editor** section.
3.  Click **+ New query**.
4.  Copy the entire content of the SQL script below and paste it into the editor.
5.  Click **RUN**. This will set up everything you need.

<details>
<summary><strong>Click to expand the full Supabase Setup SQL Script</strong></summary>

```sql
-- ========= ENCRYPTION SETUP =========
-- 1. Enable the pgsodium extension
CREATE EXTENSION IF NOT EXISTS pgsodium WITH SCHEMA pgsodium;

-- 2. Create a key to encrypt data
-- IMPORTANT: This key is stored in a protected schema. 
-- Keep this key safe and do not expose it on the client side.
INSERT INTO pgsodium.key (raw_key_new, name)
VALUES (pgsodium.crypto_aead_det_keygen(), 'dreampixel_encryption_key')
ON CONFLICT (name) DO NOTHING;

-- ========= TABLE: profiles =========
-- Stores public user data upon sign-up.
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT
);
-- Allow users to view their own profile and all other profiles.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Function to automatically create a profile when a new user signs up.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Trigger the function on new user creation.
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ========= TABLE: creations =========
-- Stores liked creations with encrypted prompts.
CREATE TABLE public.creations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  prompt BYTEA, -- Encrypted prompt
  image_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
-- Enable RLS and set policies
ALTER TABLE public.creations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own creations." ON public.creations
  FOR ALL USING (auth.uid() = user_id);

-- RPC to create an encrypted creation
CREATE OR REPLACE FUNCTION create_encrypted_creation(p_prompt TEXT, p_image_url TEXT, p_user_id UUID)
RETURNS void AS $$
DECLARE
  key_id UUID;
BEGIN
  SELECT id INTO key_id FROM pgsodium.key WHERE name = 'dreampixel_encryption_key';
  INSERT INTO public.creations (user_id, prompt, image_url)
  VALUES (
    p_user_id,
    pgsodium.crypto_aead_det_encrypt(p_prompt::bytea, 'dreampixel'::bytea, key_id),
    p_image_url
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC to get decrypted creations
CREATE OR REPLACE FUNCTION get_decrypted_creations(p_user_id UUID)
RETURNS TABLE(id UUID, prompt TEXT, image_url TEXT, created_at TIMESTAMPTZ) AS $$
DECLARE
  key_id UUID;
BEGIN
  SELECT id INTO key_id FROM pgsodium.key WHERE name = 'dreampixel_encryption_key';
  RETURN QUERY
  SELECT
    c.id,
    pgsodium.crypto_aead_det_decrypt(c.prompt, 'dreampixel'::bytea, key_id)::TEXT,
    c.image_url,
    c.created_at
  FROM public.creations c
  WHERE c.user_id = p_user_id
  ORDER BY c.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ========= TABLE: feedback =========
-- Collects user feedback with encrypted content.
CREATE TABLE public.feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE, -- Can be NULL for anonymous feedback
  content BYTEA, -- Encrypted content
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
-- Allow anyone to insert feedback.
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow feedback submission" ON public.feedback FOR INSERT WITH CHECK (true);

-- RPC to submit encrypted feedback
CREATE OR REPLACE FUNCTION submit_encrypted_feedback(p_content TEXT, p_user_id UUID DEFAULT NULL)
RETURNS void AS $$
DECLARE
  key_id UUID;
BEGIN
  SELECT id INTO key_id FROM pgsodium.key WHERE name = 'dreampixel_encryption_key';
  INSERT INTO public.feedback (user_id, content)
  VALUES (
    p_user_id,
    pgsodium.crypto_aead_det_encrypt(p_content::bytea, 'dreampixel_feedback'::bytea, key_id)
  );
END;
$$ LANGUAGE plpgsql;


-- ========= JOB LOGGING TABLES =========
-- These tables log inputs for analytics and debugging. They don't need RLS if only accessed via service_role key on a server.
-- However, for Supabase client usage, we add policies to allow users to insert their own jobs.
CREATE TABLE public.thumbnail_generation_jobs (
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
ALTER TABLE public.thumbnail_generation_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can insert their own thumbnail jobs" ON public.thumbnail_generation_jobs FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.political_poster_jobs (
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
ALTER TABLE public.political_poster_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can insert their own poster jobs" ON public.political_poster_jobs FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.ad_banner_jobs (
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
ALTER TABLE public.ad_banner_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can insert their own ad banner jobs" ON public.ad_banner_jobs FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.social_media_post_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  topic TEXT,
  platform TEXT,
  tone TEXT,
  call_to_action TEXT,
  style_id TEXT,
  aspect_ratio TEXT
);
ALTER TABLE public.social_media_post_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can insert their own social post jobs" ON public.social_media_post_jobs FOR INSERT WITH CHECK (auth.uid() = user_id);
```
</details>

### 6. Set Up Google Authentication

To enable users to sign in with Google, you need to connect your Supabase project to a Google Cloud project.

1.  **In Supabase:**
    -   Go to **Authentication > Providers** in your Supabase dashboard.
    -   Find **Google** in the list and expand it.
    -   You will see a **Callback URL**. Click to copy it. You'll need this in the next step.

2.  **In Google Cloud Console:**
    -   Go to the [Google Cloud Console](https://console.cloud.google.com/).
    -   Create a new project or select an existing one.
    -   Navigate to **APIs & Services > Credentials**.
    -   Click **+ CREATE CREDENTIALS** and select **OAuth client ID**.
    -   If prompted, configure your consent screen first. For `User Type`, select **External**. Provide an app name, user support email, and developer contact information.
    -   For `Application type`, select **Web application**.
    -   Under **Authorized redirect URIs**, click **+ ADD URI**.
    -   Paste the **Callback URL** you copied from Supabase here.
    -   Click **CREATE**.

3.  **Back in Supabase:**
    -   After creating the credentials in Google Cloud, a modal will show your **Client ID** and **Client Secret**.
    -   Copy the **Client ID** from Google Cloud and paste it into the **Client ID** field in Supabase.
    -   Copy the **Client Secret** from Google Cloud and paste it into the **Client Secret** field in Supabase.
    -   **Crucially, make sure the "Enable Provider" toggle for Google is turned ON.**
    -   Click **Save**.

### 7. Run the Application

Now you can start the development server:

```bash
npm run dev
```
The application should now be running locally, connected to your Supabase backend.
