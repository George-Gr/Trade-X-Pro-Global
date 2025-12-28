# Supabase Setup Guide

## Quick Fix for Authentication Errors

If you're seeing `net::ERR_NAME_NOT_RESOLVED` or `Failed to fetch` errors, your Supabase configuration is incorrect.

## The Problem

Your `.env.local` file contains placeholder values:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

These are not real URLs and cause DNS resolution errors.

## Solution

### Step 1: Get Your Real Supabase Credentials

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project (or create a new one)
3. Go to **Settings** → **API**
4. Copy the following values:
   - **Project URL** (looks like: `https://your-project-id.supabase.co`)
   - **anon public** key (starts with `eyJ...`)

### Step 2: Update Your Environment File

Replace the contents of `.env.local` with your real credentials:

```env
# Replace these with your actual Supabase credentials
VITE_SUPABASE_URL=https://your-actual-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-actual-anon-key

# Optional: Sentry (if used)
# VITE_SENTRY_DSN=your-sentry-dsn
```

### Step 3: Restart Your Development Server

```bash
# Stop the current dev server (Ctrl+C)
npm run dev
```

## Enhanced Error Handling

The application now includes better error handling:

- **Placeholder Detection**: Automatically detects and reports placeholder values
- **User-Friendly Messages**: Converts technical errors into readable messages
- **Connection Error Handling**: Specifically handles network/DNS issues

## Common Error Messages Fixed

| Old Error                    | New Error Message                                                        |
| ---------------------------- | ------------------------------------------------------------------------ |
| `net::ERR_NAME_NOT_RESOLVED` | "Connection error. Please check your internet connection and try again." |
| `Failed to fetch`            | "Connection error. Please check your internet connection and try again." |
| Placeholder URLs             | "Invalid VITE_SUPABASE_URL: Please replace placeholder values..."        |

## Testing Your Setup

1. Start the dev server: `npm run dev`
2. Navigate to the login page
3. Try logging in (you should see proper error messages now)

If you still get connection errors after updating credentials:

- Check your internet connection
- Verify the Supabase URL is correct
- Ensure your Supabase project is active

## Security Notes

- The `VITE_SUPABASE_PUBLISHABLE_KEY` is safe to expose in frontend code
- Supabase uses Row Level Security (RLS) for data protection
- Never commit your `.env.local` file to version control

## Troubleshooting

### Still Getting DNS Errors?

1. **Verify URL Format**: Your Supabase URL should end with `.supabase.co` or `.supabase.in`
2. **Check Project Status**: Ensure your Supabase project is not paused
3. **Network Issues**: Try accessing your Supabase URL directly in a browser

### Authentication Still Failing?

1. **Check API Key**: Ensure you're using the `anon` key, not `service_role`
2. **Email Confirmation**: New users may need to confirm their email
3. **Database Setup**: Ensure your Supabase project has the required tables

## Need Help?

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord Community](https://discord.supabase.com)
- Check the browser console for detailed error messages
