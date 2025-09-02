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
-   **Focused on Google Gemini**: Built to exclusively use Google's powerful Gemini AI models for the best results.
-   **Live API Status**: An indicator in the header shows if the default API key is configured correctly and is operational.
-   **Interactive & Modern UI**: A vibrant, colorful UI with a neon mouse trail, glowing hover effects, and an animated background that synchronizes with AI generation tasks.
-   **Personalized History**: Like and save your favorite creations, stored securely and tied to your user account.

---

## 🛠️ Tech Stack

-   **Frontend**: React, TypeScript, Vite
-   **Styling**: Tailwind CSS
-   **AI API**: Google Gemini
-   **Backend & Auth**: Supabase (Auth, PostgreSQL with `pgsodium` for encryption)
-   **Icons**: `react-icons`

---

## 🚀 Getting Started

Follow these instructions to set up and run the project locally.

### 1. Prerequisites

-   [Node.js](https://nodejs.org/) (v18.x or later)
-   A [Supabase](https://supabase.com/) account (the free tier is sufficient).
-   A Google Gemini API Key.

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

### 4. Set Up Your Gemini API Key (Required)

This application requires a Google Gemini API key to function, provided via an environment variable.

1.  **Get your API Key**:
    -   Go to [**Google AI Studio**](https://aistudio.google.com/app/apikey).
    -   Click **"Create API key in new project"**.
    -   Copy your newly generated API key.

2.  **Set the environment variable**:
    -   Create a file named `.env.local` in the project root.
    -   Add your API key to this file:
    ```
    # .env.local
    GEMINI_API_KEY=YOUR_SECRET_GEMINI_API_KEY
    ```

3.  **Expose the Key to the App (CRITICAL FIX FOR VITE)**:
    -   By default, for security, the Vite build tool **does not** expose environment variables to your application code unless they are prefixed with `VITE_`.
    -   To make `GEMINI_API_KEY` available as requested, you must explicitly configure Vite to expose it. This is the **required fix** to prevent API connection errors.
    -   Create a file named `vite.config.ts` in your project root (if it doesn't already exist) and add the following configuration:

    ```typescript
    // vite.config.ts
    import { defineConfig, loadEnv } from 'vite';
    import react from '@vitejs/plugin-react';

    export default defineConfig(({ mode }) => {
      // Load env file based on `mode` in the current working directory.
      const env = loadEnv(mode, process.cwd(), '');

      return {
        plugins: [react()],
        define: {
          // Expose the environment variable to your client-side code
          'import.meta.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
        }
      }
    });
    ```
    -   After creating or modifying `vite.config.ts`, you **must restart your development server** for the changes to take effect.

> #### How API Key Usage Works
> This application is designed to be secure and straightforward. It reads the `GEMINI_API_KEY` you provide. This key is loaded when the app starts and is **never** changed or modified by the application's code, including during login or logout.
>
> The key you get from Google AI Studio includes a generous **free tier**, which is perfect for all development and testing purposes.

> **Note on Supabase Credentials**: The Supabase URL and anonymous key are pre-configured in `src/services/supabaseClient.ts` to ensure a stable connection for development. No action is needed for this part.

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
  is_public BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
-- Enable RLS and set policies
ALTER TABLE public.creations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own creations." ON public.creations
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Public creations are viewable by everyone." ON public.creations
  FOR SELECT USING (is_public = TRUE);

-- RPC to create an encrypted creation
CREATE OR REPLACE FUNCTION create_encrypted_creation(p_prompt TEXT, p_image_url TEXT, p_user_id UUID, p_is_public BOOLEAN DEFAULT false)
RETURNS void AS $$
DECLARE
  key_id UUID;
BEGIN
  SELECT id INTO key_id FROM pgsodium.key WHERE name = 'dreampixel_encryption_key';
  INSERT INTO public.creations (user_id, prompt, image_url, is_public)
  VALUES (
    p_user_id,
    pgsodium.crypto_aead_det_encrypt(p_prompt::bytea, 'dreampixel'::bytea, key_id),
    p_image_url,
    p_is_public
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
  headshot_filenames TEXT[]
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
    -   You will see a **Callback URL** listed there. Copy this URL for the next step. It will look something like `https://<your-project-ref>.supabase.co/auth/v1/callback`.

2.  **In Google Cloud Console:**
    -   Go to the [Google Cloud Console](https://console.cloud.google.com/).
    -   Create a new project or select an existing one.
    -   Navigate to **APIs & Services > Credentials**.
    -   Click **+ CREATE CREDENTIALS** and select **OAuth client ID**.
    -   If prompted, configure your consent screen first. For `User Type`, select **External**. Provide an app name, user support email, and developer contact information.
    -   For `Application type`, select **Web application**.
    -   Under **Authorized redirect URIs**, click **+ ADD URI**.
    -   Paste your project's **Callback URL** that you copied from Supabase here.
    -   Click **CREATE**.

3.  **Configure Site URLs in Supabase (CRITICAL):**
    -   For Google login to redirect back to your app correctly, you must tell Supabase where your app is hosted.
    -   Go to **Authentication > URL Configuration** in your Supabase dashboard.
    -   Set the **Site URL** to the main URL of your application (e.g., `http://localhost:5173` for local Vite development, or your production URL `https://ai.dreampixeltechnology.in`).
    -   In the **Redirect URLs** section below, add any other URLs you might use. It's good practice to add your Site URL here as well. Wildcards are supported (e.g., `http://localhost:*`, `https://*.vercel.app`).
    -   Click **Save**.

4.  **Connect Google Credentials in Supabase:**
    -   After creating the credentials in Google Cloud, a modal will show your **Client ID** and **Client Secret**.
    -   Go back to **Authentication > Providers > Google** in your Supabase dashboard.
    -   Copy the **Client ID** from Google Cloud and paste it into the **Client ID** field in Supabase.
    -   Copy the **Client Secret** from Google Cloud and paste it into the **Client Secret** field in Supabase.
    -   **Crucially, make sure the "Enable Provider" toggle for Google is turned ON.**
    -   Click **Save**.

### 7. Run the Application

Now you can start the development server.

```bash
npm run dev
```
The application should now be running locally and is ready to use.

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
  is_public BOOLEAN DEFAULT false NOT NULL,
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
  headshot_filenames TEXT[]
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