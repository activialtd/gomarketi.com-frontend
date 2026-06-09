# GoMarket Monorepo

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
