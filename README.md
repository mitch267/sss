# Furniture Shop — Cloudflare Worker + Static Assets

Configured for:
- GitHub repository: `mitch267/furniture-shop`
- Cloudflare Worker: `falling-morning-cd72`
- Production URL: `https://falling-morning-cd72.mmkoosaletse.workers.dev`

## Repository structure
- `src/worker.js` — GitHub OAuth backend for Decap CMS
- `public/` — storefront, CMS, product data and uploaded images
- `wrangler.jsonc` — Cloudflare Worker + Static Assets configuration
- `package.json` — Wrangler dependency and deployment scripts

## Replace the files in your GitHub repository
Upload the CONTENTS of this package to the root of `mitch267/furniture-shop`.
Do not place the whole package inside another folder.

Your GitHub root should show `wrangler.jsonc`, `package.json`, `src`, and `public`.

## Cloudflare Git build
Connect `mitch267/furniture-shop` to the existing Worker `falling-morning-cd72`.
Use the `main` branch.

Recommended build/deploy settings:
- Root directory: `/` (repository root)
- Build command: leave blank if Cloudflare permits it, otherwise `npm install`
- Deploy command: `npx wrangler deploy`

## Required Worker variables/secrets
After the Worker deployment is active, add:
- `GITHUB_CLIENT_ID` — your GitHub OAuth App Client ID
- `GITHUB_CLIENT_SECRET` — your GitHub OAuth App Client Secret (store as Secret)
- `GITHUB_REPO_PRIVATE` — `false` for a public repository, `true` for private

Then redeploy.

## GitHub OAuth App
Homepage URL:
`https://falling-morning-cd72.mmkoosaletse.workers.dev`

Authorization callback URL:
`https://falling-morning-cd72.mmkoosaletse.workers.dev/api/callback`

## Admin
Open:
`https://falling-morning-cd72.mmkoosaletse.workers.dev/admin/`

The CMS is already configured for `mitch267/furniture-shop` on branch `main`.
