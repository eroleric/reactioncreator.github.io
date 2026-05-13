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
  Images/
    9_16_layout.png
    9_16_layout_side_view.png
    9_16_layout_tool.png
    Applogo image.png
    chroma.png
    export_page.png
    export_page_side_view.png
    Faviconapp icon.png
    google-play-badge.png
    video_preview.png
    video_preview_side_view.png
  assets/
    css/
      styles.css
    js/
      main.js
    img/
      app-logo.png
      chroma.png
      export-page.png
      export-page-side-view.png
      favicon.png
      google-play-badge.png
      layout-9-16.png
      layout-9-16-side-view.png
      layout-9-16-tools.png
      video-preview.png
      video-preview-side-view.png
```

## Asset Mapping

- `app-logo.png` is used for the app logo media section and support page.
- `favicon.png` is used for the browser icon and small header brand mark.
- `google-play-badge.png` is used on the Home and Pricing pages.
- `layout-9-16.png` is used in the Home hero.
- `layout-9-16-tools.png` is used on the Features page.
- `chroma.png` is used for the Chroma layout feature section.
- `video-preview-side-view.png` is used as a promotional preview image.
- `export-page-side-view.png` is used as a promotional exports image.
- The original uploaded PNGs are preserved in `Images/`.

## Still Needed Before Launch

- Replace Google Play links with the live Play Store URL.
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
