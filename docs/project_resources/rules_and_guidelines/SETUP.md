# Developer Setup Guide

**Last Updated:** December 2025  
**Scope:** Trade-X-Pro-Global Local Development Environment

---

## 1. Prerequisites

### 1.1 Required Software
- **Git** 2.40+ ([download](https://git-scm.com/))
- **Node.js** 20.x LTS ([download](https://nodejs.org/))
- **npm** 10.x (included with Node.js)
- **Git account** with SSH keys configured
- **Text Editor/IDE**: VS Code recommended ([download](https://code.visualstudio.com/))

### 1.2 Required Accounts
- **GitHub** account with access to [Trade-X-Pro-Global](https://github.com/trade-x-pro/trade-x-pro-global)
- **Supabase** account (for local development database)
- Optional: Docker Desktop (for local Supabase instance)

### 1.3 System Requirements
| Requirement | Minimum | Recommended |
|---|---|---|
| OS | macOS 11+ / Ubuntu 20.04+ / Windows 10+ | Latest stable |
| RAM | 8 GB | 16 GB |
| Disk Space | 5 GB free | 10 GB free |
| Node.js | 20.0.0 | 20.11.0+ |

---

## 2. Quick Start (5 minutes)

### 2.1 Clone Repository
```bash
# SSH (recommended if you have SSH keys configured)
git clone git@github.com:trade-x-pro/trade-x-pro-global.git

# HTTPS (if SSH not configured)
git clone https://github.com/trade-x-pro/trade-x-pro-global.git

cd trade-x-pro-global
```

### 2.2 Install Dependencies
```bash
# Install npm packages
npm install

# Verify installation
npm run lint
```

### 2.3 Configure Environment
```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local with your Supabase credentials
# See ENVIRONMENT.md for detailed configuration
code .env.local
```

### 2.4 Start Development Server
```bash
# Start Vite dev server
npm run dev

# Open in browser: http://localhost:5173
```

✅ **You're ready to develop!**

---

## 3. Environment Setup (Detailed)

### 3.1 Supabase Configuration

#### Option A: Cloud Supabase (Recommended for New Developers)

1. **Create Supabase Project**:
   - Go to https://supabase.com/dashboard
   - Click "New Project"
   - Choose region (closest to your location)
   - Create project (takes ~5 minutes)

2. **Get API Credentials**:
   - Go to Project Settings → API
   - Copy `Project URL` → VITE_SUPABASE_URL
   - Copy `Publishable anon key` → VITE_SUPABASE_PUBLISHABLE_KEY

3. **Update .env.local**:
   ```bash
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

#### Option B: Local Supabase (Advanced)

**Prerequisites**: Docker Desktop installed

1. **Install Supabase CLI**:
   ```bash
   npm install -g supabase
   ```

2. **Initialize Local Supabase**:
   ```bash
   supabase init
   supabase start
   ```

3. **Get Local Credentials**:
   ```bash
   supabase status
   ```

4. **Update .env.local**:
   ```bash
   VITE_SUPABASE_URL=http://localhost:54321
   VITE_SUPABASE_PUBLISHABLE_KEY=[from supabase status output]
   ```

**Advantages**: Offline development, no network calls, full control  
**Disadvantages**: Requires Docker, more setup time

### 3.2 Complete Environment File

```bash
# Required: Supabase
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Optional: API Endpoints (defaults to local)
VITE_API_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3000

# Optional: Development Tools
VITE_SENTRY_DSN=https://key@sentry.io/project-id
VITE_FINNHUB_API_KEY=your_api_key_here

# Optional: Feature Flags
VITE_ENABLE_ADVANCED_CHARTS=false
VITE_ENABLE_COPY_TRADING=false
VITE_ENABLE_API_ACCESS=false

# Environment
VITE_ENV=development
```

---

## 4. IDE Setup (VS Code)

### 4.1 Recommended Extensions

Install these VS Code extensions:

| Extension | ID | Purpose |
|---|---|---|
| ESLint | dbaeumer.vscode-eslint | Linting |
| Prettier | esbenp.prettier-vscode | Code formatting |
| Tailwind CSS IntelliSense | bradlc.vscode-tailwindcss | Tailwind autocomplete |
| TypeScript Vue Plugin | Vue.volar | Vue/TypeScript support |
| Thunder Client | rangav.vscode-thunder-client | API testing |
| GitLens | eamodio.gitlens | Git integration |
| Better Comments | aaron-bond.better-comments | Comment highlighting |

**Install all at once**:
```bash
code --install-extension dbaeumer.vscode-eslint \
     --install-extension esbenp.prettier-vscode \
     --install-extension bradlc.vscode-tailwindcss \
     --install-extension Vue.volar \
     --install-extension rangav.vscode-thunder-client \
     --install-extension eamodio.gitlens \
     --install-extension aaron-bond.better-comments
```

### 4.2 VS Code Settings

Create/update `.vscode/settings.json`:

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.defaultRulesDirectory": "node_modules/@typescript-eslint/eslint-plugin/dist/rules",
  "typescript.suggest.autoImports": true,
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

### 4.3 Launch Configurations

Create/update `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Tests",
      "runtimeExecutable": "${workspaceFolder}/node_modules/.bin/vitest",
      "args": ["run", "--inspect-brk"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

---

## 5. Development Workflow

### 5.1 Common Commands

```bash
# Start development server (with HMR)
npm run dev

# Format code
npm run format

# Lint code (show errors)
npm run lint

# Auto-fix linting issues
npm run lint --fix

# Run tests in watch mode
npm run test

# Run tests with UI
npm run test:ui

# Build for production
npm run build

# Preview production build locally
npm run preview

# Generate TypeScript types from Supabase
npm run supabase:pull

# Run type checking
npm run type:check

# Run strict type checking
npm run type:strict
```

### 5.2 Git Workflow

1. **Create feature branch**:
   ```bash
   git checkout -b feat/description
   ```

2. **Make changes and commit**:
   ```bash
   git add .
   git commit -m "feat: add new trading feature"
   ```

3. **Push to GitHub**:
   ```bash
   git push origin feat/description
   ```

4. **Create Pull Request**:
   - Go to https://github.com/trade-x-pro/trade-x-pro-global/pulls
   - Click "New Pull Request"
   - Select your branch
   - Fill PR template
   - Request reviewers

5. **After approval**:
   ```bash
   git checkout main
   git pull origin main
   ```

---

## 6. Database Setup

### 6.1 Run Migrations

Migrations are automatically applied when using Supabase. To verify:

```bash
# View applied migrations
supabase migration list

# Apply pending migrations
supabase db push
```

### 6.2 Import Test Data (Optional)

```bash
# Seed database with test data (if seed script exists)
npm run db:seed

# Or manually insert via Supabase dashboard
# Go to SQL Editor → Run custom SQL
```

### 6.3 Database Inspection

View your database schema:
```bash
# Via Supabase dashboard
# https://supabase.com/dashboard/project/[PROJECT_ID]/editor

# Or via CLI
supabase db list
supabase db tables
```

---

## 7. Troubleshooting

### 7.1 Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| **"Cannot find module @/..."** | Wrong path alias | Check `tsconfig.json` paths, use `@/` prefix |
| **Port 5173 already in use** | Another process running | `lsof -i :5173` then `kill -9 [PID]` |
| **ENOENT: no such file or directory** | Missing node_modules | Run `npm install` again |
| **Supabase connection fails** | Wrong credentials | Check .env.local has correct URL and key |
| **Tests failing with "Cannot find module"** | Wrong import path | Use `@/` paths consistently |
| **HMR not working** | Firewall/network issue | Restart dev server: `npm run dev` |

### 7.2 Debug Mode

```bash
# Run with verbose logging
npm run dev -- --debug

# Debug tests
npm run test -- --inspect-brk

# Debug browser
# Open chrome://inspect after starting test
```

### 7.3 Clean Rebuild

If experiencing strange errors:

```bash
# Remove caches and reinstall
npm run dev:clean

# Or manually:
rm -rf node_modules package-lock.json .vite
npm install
npm run dev
```

---

## 8. Pre-Commit Checklist

Before committing changes:

- [ ] **Code runs locally**: `npm run dev` works
- [ ] **Tests pass**: `npm run test` all green
- [ ] **Linting passes**: `npm run lint` no errors
- [ ] **No console.log**: Search for `console.log` and remove
- [ ] **No secrets**: Check `.env.local` not in git
- [ ] **Types correct**: `npm run type:check` passes
- [ ] **Commit message clear**: Follows convention (feat:/fix:/etc)

---

## 9. Performance Optimization

### 9.1 Dev Server Optimization

```bash
# Skip middleware plugins during dev
npm run dev -- --no-cors

# Increase memory for Node
NODE_OPTIONS=--max_old_space_size=4096 npm run dev
```

### 9.2 Build Optimization

```bash
# Analyze bundle size
ANALYZE=true npm run build

# View report
open dist/bundle-analysis.html
```

---

## 10. Next Steps

1. ✅ Run `npm run dev`
2. ✅ Open http://localhost:5173
3. ✅ Login with test account
4. ✅ Read `PRD.md` for feature overview
5. ✅ Check `docs/` for architecture details
6. ✅ Create a feature branch and start coding!

---

## 11. Getting Help

- **Documentation**: See `/docs/` folder
- **Questions**: Ask in GitHub Discussions
- **Issues**: Report bugs on GitHub Issues
- **Slack**: Direct message project leads
- **Email**: dev@trade-x-pro.dev

---

## 12. Additional Resources

- [Node.js Documentation](https://nodejs.org/docs/)
- [VS Code Guide](https://code.visualstudio.com/docs)
- [Git Documentation](https://git-scm.com/doc)
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

**Welcome to Trade-X-Pro-Global development!** 🚀

Questions? Email dev@trade-x-pro.dev
