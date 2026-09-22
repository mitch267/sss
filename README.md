# Furniture Shop — Cloudflare Pages Direct Upload (v3)

This version is made for Cloudflare Pages **Direct Upload / drag-and-drop ZIP deployments**.
It uses a root `_worker.js` instead of a `/functions` directory, so Cloudflare can accept the ZIP and provide the GitHub OAuth routes used by Decap CMS.

## 1. GitHub repository is still required
Decap CMS stores product edits in GitHub. Create a repository containing this site's files, then edit `admin/config.yml`:

    repo: YOUR_GITHUB_USERNAME/YOUR_REPOSITORY
    branch: main

The repository must contain `data/products.json`, `admin/`, and the rest of this site.

## 2. Create a GitHub OAuth App
In GitHub go to Settings > Developer settings > OAuth Apps > New OAuth App.

Use your production Cloudflare Pages URL for:
- Homepage URL: `https://YOUR-SITE.pages.dev`
- Authorization callback URL: `https://YOUR-SITE.pages.dev/api/callback`

If you use a custom domain, use that same domain consistently instead.

Copy the Client ID and generate a Client Secret.

## 3. Add Cloudflare environment variables
In your Cloudflare Pages project settings add:
- `GITHUB_CLIENT_ID` = GitHub OAuth Client ID
- `GITHUB_CLIENT_SECRET` = GitHub OAuth Client Secret (encrypt/secret)
- `GITHUB_REPO_PRIVATE` = `false` for a public repo, or `true` for a private repo

Redeploy after adding/changing variables.

## 4. Set the CMS site address
Edit `admin/config.yml` and replace both occurrences of the old demo hostname with your actual production hostname:

    base_url: https://YOUR-SITE.pages.dev
    site_domain: YOUR-SITE.pages.dev

`auth_endpoint` must remain:

    auth_endpoint: api/auth

## 5. Upload to Cloudflare Pages
Upload the ZIP using the Cloudflare Pages drag-and-drop deployment screen. `_worker.js` must remain at the root of the ZIP beside `index.html`.

Then open:

    https://YOUR-SITE.pages.dev/admin/

Click **Login with GitHub**.

## 6. Managing the shop
In the CMS, open **Store Manager > Products, Specials & Store Settings**. You can add/edit/remove products, upload product images, change prices, enable sale pricing, set stock status, and update store details/logo.

Publishing writes the changed content to the GitHub repository. Because a Direct Upload Pages project does not automatically redeploy from GitHub commits, changes committed by Decap will not automatically update the manually uploaded Pages deployment. For fully automatic product publishing, create a Git-integrated Pages project or add a separate deployment workflow.

## Important
Do not add a `/functions` folder back to this ZIP. Cloudflare dashboard drag-and-drop does not compile Pages Functions folders. This package deliberately uses `_worker.js` Advanced Mode.
