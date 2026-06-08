Deploy the current project to GitHub and enable GitHub Pages. Return the live GitHub Pages URL when done.

## Steps

### 1. Check prerequisites

Run `gh --version` to confirm the GitHub CLI is installed. If the command is not found, it may still be installed but off PATH — try `brew list gh` or `which gh`. If genuinely missing, tell the user to run `brew install gh` and stop.

Run `git --version` to confirm git is installed.

### 2. Authenticate with GitHub

Run `gh auth status` to check if the user is already logged in.

If not authenticated, tell the user to run `! gh auth login` in the prompt (the `!` prefix runs it interactively in this session). Wait for confirmation before continuing.

Get the authenticated username: `gh api user --jq '.login'` — store this as `USERNAME`.

### 3. Determine repository name

Use the `name` field from `package.json` as the repo name, converting spaces to hyphens and lowercasing. Store as `REPO_NAME`.

If `package.json` has no `name`, default to the current directory name.

### 4. Initialize git if needed

Check `git status`. If the directory is not a git repo, run:
```bash
git init
git checkout -b main
```

Verify a `.gitignore` exists that includes `node_modules/` and `.env*`. The `.env*` exclusion is critical — if `.env` ever gets committed to a branch, git will delete the file when switching back to a branch where it is untracked.

### 5. Check if remote GitHub repo exists

Run `gh repo view USERNAME/REPO_NAME --json name`.

- If it exists, confirm with the user whether to use it or pick a different name.
- If it does not exist, create it: `gh repo create REPO_NAME --public --source=. --remote=origin --push=false`

If a remote named `origin` already exists but points elsewhere, show the user the current remote and ask how to proceed.

### 6. Configure Vite base URL for GitHub Pages

Read `vite.config.ts`. GitHub Pages serves the app from `https://USERNAME.github.io/REPO_NAME/`, so Vite's `base` must match.

- If `base` is already set to `/REPO_NAME/`, skip this step.
- Otherwise, add or update `base: '/REPO_NAME/'` inside `defineConfig({...})`.

Without this, all asset paths will be wrong and the app will show a blank page.

### 7. Fix React Router basename (React SPA apps only)

If the project uses React Router (`BrowserRouter` in `src/main.tsx` or similar), it must know about the subpath. Without this the router matches no routes and the page renders blank.

Check `src/main.tsx` for `<BrowserRouter>`. If there is no `basename` prop, add it:

```tsx
<BrowserRouter basename="/REPO_NAME">
```

### 8. Add 404.html for SPA routing

GitHub Pages returns a real 404 for any URL that isn't a file. This breaks direct links and page refreshes in SPAs. Fix it by adding `public/404.html` with this content:

```html
<!doctype html>
<html>
<head>
<meta charset="utf-8">
<script>
  var l = window.location;
  l.replace(
    l.protocol + '//' + l.hostname + (l.port ? ':' + l.port : '') +
    l.pathname.split('/').slice(0, 2).join('/') +
    '/?p=/' + l.pathname.slice(1).split('/').slice(1).join('/').replace(/&/g, '~and~') +
    (l.search ? '&q=' + l.search.slice(1).replace(/&/g, '~and~') : '') +
    l.hash
  );
</script>
</head>
<body></body>
</html>
```

And add the corresponding decode script inside `<head>` of `index.html`:

```html
<script>
  (function() {
    var p = new URLSearchParams(window.location.search).get('p');
    if (p) {
      var q = new URLSearchParams(window.location.search).get('q');
      window.history.replaceState(null, null,
        window.location.pathname + p + (q ? '?' + q.replace(/~and~/g, '&') : '') + window.location.hash
      );
    }
  })();
</script>
```

### 9. Verify environment variables are present before building

Vite bakes `VITE_*` variables from `.env` into the bundle at build time. If `.env` is missing, all `import.meta.env.VITE_*` values will be `undefined` and the app will silently break (e.g. Supabase throws "supabaseUrl is required").

Check that `.env` exists and contains the required variables before proceeding. If it is missing, ask the user to provide the values and recreate it.

### 10. Build the project

Run `npm run build`. The output goes to `build/` per project config.

If the build fails, print the error and stop.

After the build, spot-check that env vars are baked in, e.g.:
```bash
grep -o 'YOUR_EXPECTED_DOMAIN' build/assets/index-*.js | head -1
```

### 11. Push source to main

```bash
git add -A
git commit -m "Deploy to GitHub Pages" || true   # ok if nothing new
git remote set-url origin https://github.com/USERNAME/REPO_NAME.git 2>/dev/null || \
  git remote add origin https://github.com/USERNAME/REPO_NAME.git
git push -u origin main
```

If the push is rejected due to diverged history (non-fast-forward), force-push is acceptable for this project since this repo is owned by the user:
```bash
git push origin main --force
```

### 12. Deploy build output to gh-pages branch

**Never use `git subtree push` or the orphan branch approach directly** — both require `build/` to be tracked by git, but it is gitignored. Manually creating an orphan branch also deletes `.gitignore`, causing `git add -A` to accidentally commit `node_modules/` and `.env`.

Use the `gh-pages` npm package instead — it handles all of this safely:

```bash
npx gh-pages -d build --branch gh-pages --message "Deploy to GitHub Pages"
```

### 13. Enable GitHub Pages on the gh-pages branch

```bash
gh api repos/USERNAME/REPO_NAME/pages \
  --method POST \
  -f 'source[branch]=gh-pages' \
  -f 'source[path]=/' \
  2>/dev/null || \
gh api repos/USERNAME/REPO_NAME/pages \
  --method PUT \
  -f 'source[branch]=gh-pages' \
  -f 'source[path]=/'
```

Note: use `-f` (not `--field`) to avoid shell glob expansion on the `[branch]` syntax.

### 14. Verify the deployment

Poll until GitHub Pages finishes building:
```bash
gh api repos/USERNAME/REPO_NAME/pages --jq '{status: .status, url: .html_url}'
```

Once `status` is `"built"`, confirm the live bundle actually contains the expected content:
```bash
curl -s "https://USERNAME.github.io/REPO_NAME/" | grep -o 'index-[^"]*\.js'
# Then spot-check the bundle for a known string (e.g. Supabase URL, app title):
curl -s "https://USERNAME.github.io/REPO_NAME/assets/<bundle>.js" | grep -o 'EXPECTED_STRING' | head -1
```

GitHub Pages has CDN caching — verifying the bundle filename confirms the new deploy is live, not the old cached version.

### 15. Return the live URL

```
GitHub repository : https://github.com/USERNAME/REPO_NAME
GitHub Pages URL  : https://USERNAME.github.io/REPO_NAME/
```

## Error handling

- **`gh` not found** — may be installed but off PATH; try `brew list gh`. If missing: `brew install gh`.
- **Auth errors** — tell the user to run `! gh auth login` interactively.
- **Build errors** — show the exact output and stop. Do not push.
- **Push rejected (non-fast-forward)** — force-push with `git push origin main --force` (user owns the repo).
- **Pages API 409 Conflict** — Pages already enabled; the PUT fallback above handles this automatically.
- **Blank page after deploy** — almost always one of three causes:
  1. Vite `base` not set → assets 404
  2. `BrowserRouter` missing `basename` → React Router matches nothing
  3. `.env` missing at build time → `import.meta.env.VITE_*` is `undefined`, crashing the app
- **"supabaseUrl is required" (or similar)** — `.env` was missing when `npm run build` ran; recreate it and rebuild.
- **Old version still showing after deploy** — CDN cache; check the JS bundle filename in the live HTML matches what was just built.
