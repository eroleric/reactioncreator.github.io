# ReactionCreator Marketing Website

This folder contains a separate static marketing website for ReactionCreator. It was created as isolated website-only work. No Android app source, Gradle files, Firebase files, Compose files, media/export files, billing files, or app resources were edited.

## File Structure

```text
website/
  index.html
  features.html
  pricing.html
  privacy.html
  terms.html
  support.html
  robots.txt
  README.md
  assets/
    css/
      styles.css
    js/
      main.js
    img/
      google-play-badge-placeholder.svg
      logo-placeholder.svg
      promo-video-placeholder.svg
      screenshot-chroma-placeholder.svg
      screenshot-editor-placeholder.svg
      screenshot-exports-placeholder.svg
```

## What To Replace Before Launch

- Replace `assets/img/logo-placeholder.svg` with the final logo or website logo.
- Replace screenshot placeholder SVGs with real app screenshots.
- Replace `assets/img/promo-video-placeholder.svg` with a real promo video thumbnail, or embed/link a hosted promo video.
- Replace `assets/img/google-play-badge-placeholder.svg` with the official Google Play badge.
- Replace Google Play placeholder links with the live Play Store URL.
- Confirm the support email. The current site uses `reactioncreatorteam@gmail.com`.
- Have the Privacy Policy and Terms reviewed before publishing.

## Local Preview

This is plain static HTML, CSS, JS, and SVG. You can open `index.html` directly in a browser.

If you prefer a local server:

```powershell
cd website
python -m http.server 8080
```

Then open `http://localhost:8080`.

## Push To GitHub

Option A: make `website` its own repository.

```powershell
cd website
git init
git add .
git commit -m "Add ReactionCreator marketing website"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

Option B: keep it inside an existing repository.

```powershell
git add website
git commit -m "Add ReactionCreator marketing website"
git push
```

## Deploy On Cloudflare Pages

Cloudflare's static HTML guide says to import an existing Git repository from Workers & Pages, use your production branch such as `main`, and use `exit 0` when there is no framework build step.

Recommended settings if `website` is the repository root:

```text
Framework preset: None
Build command: exit 0
Build output directory: /
```

Recommended settings if `website` is a subfolder in a larger repository:

```text
Framework preset: None
Root directory: website
Build command: exit 0
Build output directory: /
```

After the first deploy, Cloudflare Pages will provide a `*.pages.dev` URL.

## Custom Domain

In Cloudflare Pages, open the Pages project, go to **Custom domains**, select **Set up a domain**, and enter the domain or subdomain you want to use.

For an apex domain like `example.com`, Cloudflare expects the domain to be a Cloudflare zone with nameservers pointed to Cloudflare. For a subdomain like `app.example.com`, you can use a CNAME record that points to the Pages subdomain, such as `reactioncreator.pages.dev`.

Useful Cloudflare docs:

- [Deploy static HTML on Cloudflare Pages](https://developers.cloudflare.com/pages/framework-guides/deploy-anything/)
- [Cloudflare Pages build configuration](https://developers.cloudflare.com/pages/configuration/build-configuration/)
- [Cloudflare Pages custom domains](https://developers.cloudflare.com/pages/configuration/custom-domains/)
