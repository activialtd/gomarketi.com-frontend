# Wojalo Monorepo

This repository uses **Turborepo** and **pnpm workspaces**. All installations and scripts must be run from the **root directory**.

## 🛠️ 1. Initial Setup

First, ensure you have `pnpm` installed on your machine:

```bash
npm install -g pnpm
```

Then, install all dependencies for the entire workspace from the root:

```bash
pnpm install
```

## 💻 2. Local Development

To start the local development server for the Vendor Dashboard (and watch the UI packages for changes):

```bash
pnpm turbo run dev --filter=vendor-web
```

## 🚀 3. Production & Deployment (For DevOps)

Use these commands in your CI/CD pipeline or server to build and start the app:

**Build:**

```bash
pnpm turbo run build --filter=vendor-web
```

**Start:**

```bash
pnpm turbo run start --filter=vendor-web
```

## 🌍 4. Domains

| Address | Served by |
| --- | --- |
| `wojalo.com` | `apps/web` (marketing site) |
| `<store>.wojalo.com` | `apps/web` (vendor storefronts) |
| `vendor.wojalo.com` | `apps/vendor-web` |
| `api.wojalo.com` | Backend API |

Set these in Vercel (Production) for both web projects, then redeploy:

```bash
NEXT_PUBLIC_API_URL=https://api.wojalo.com
NEXT_PUBLIC_ROOT_DOMAIN=wojalo.com   # web
NEXT_PUBLIC_STORE_DOMAIN=wojalo.com  # vendor-web
```

Old `gomarketi.com` links redirect to the same page on `wojalo.com`.
