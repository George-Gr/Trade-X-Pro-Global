# Supabase CLI Setup & Deployment Guide

## Installation Status ✅

Supabase CLI v2.58.5 has been installed as a local dev dependency in your project.

## Quick Start Guide

### 1. Authenticate with Supabase Cloud

First, log in to your Supabase account:

```bash
npx supabase login
```

This will prompt you to create an access token from your Supabase dashboard and authenticate the CLI.

### 2. Link Your Project

Link your local project to your Supabase Cloud project:

```bash
npm run supabase:link
```

You'll be prompted to select your organization and project from Supabase Cloud.

### 3. Check Project Status

Verify the connection to your Supabase project:

```bash
npm run supabase:status
```

## Available Commands

We've added the following npm scripts for easy Supabase management:

| Command                             | Description                                  |
| ----------------------------------- | -------------------------------------------- |
| `npm run supabase:link`             | Link local project to Supabase Cloud         |
| `npm run supabase:status`           | Show project status and connection info      |
| `npm run supabase:push`             | Push local migrations and functions to Cloud |
| `npm run supabase:pull`             | Pull remote changes from Cloud               |
| `npm run supabase:migrations`       | List all migrations                          |
| `npm run supabase:functions:deploy` | Deploy edge functions to Cloud               |

## Deployment Workflow

### Push Database Changes to Cloud

1. Create a new migration:

   ```bash
   npx supabase migration new migration_name
   ```

2. Add your SQL changes to the migration file in `supabase/migrations/`

3. Push to Supabase Cloud:
   ```bash
   npm run supabase:push
   ```

### Deploy Edge Functions to Cloud

1. Add/modify functions in `supabase/functions/`

2. Deploy functions:
   ```bash
   npm run supabase:functions:deploy
   ```

### Sync Local Schema with Cloud

To pull the latest schema from your Supabase Cloud project:

```bash
npm run supabase:pull
```

## Project Structure

Your Supabase configuration files are located at:

```
supabase/
├── config.toml          # Project configuration
├── functions/           # Edge functions
└── migrations/          # Database migrations
```

## Important Notes

⚠️ **No Local Supabase Instance**: This project uses Supabase Cloud directly. All migrations and functions are deployed to the cloud.

🔐 **Authentication**: Your Supabase access token is stored locally in `~/.supabase/` after login.

📝 **Migrations**: Always test migrations in a non-production environment first (e.g., preview branches or staging project).

## Troubleshooting

### "Not linked to a Supabase project"

- Run `npm run supabase:link` to link your project

### "Invalid access token"

- Run `npx supabase logout` then `npx supabase login` again

### View full CLI documentation

```bash
npx supabase --help
```

## Next Steps

1. Run `npm run supabase:login` to authenticate
2. Run `npm run supabase:link` to link your Supabase Cloud project
3. Review your existing migrations in `supabase/migrations/`
4. Deploy when ready with `npm run supabase:push`
