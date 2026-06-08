Deploy the current project to GitHub and enable GitHub Pages. Return the live GitHub Pages URL when done.

## Steps

### 1. Check prerequisites

Run `gh --version` to confirm the GitHub CLI is installed. If not found, tell the user to install it via `brew install gh` and stop.

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
```
git init
git checkout -b main
```

Create or verify a `.gitignore` that includes `node_modules/` and `.env*`.

### 5. Check if remote GitHub repo exists

Run `gh repo view USERNAME/REPO_NAME --json name` (replace placeholders with actual values).

- If it exists, confirm with the user whether to use it or pick a different name.
- If it does not exist, create it: `gh repo create REPO_NAME --public --source=. --remote=origin --push=false`

If a remote named `origin` already exists but points elsewhere, show the user the current remote and ask how to proceed before changing anything.

### 6. Configure Vite base URL for GitHub Pages

Read `vite.config.ts`. GitHub Pages serves from `https://USERNAME.github.io/REPO_NAME/`, so the Vite `base` option must be set to `/REPO_NAME/`.

- If `base` is already set to the correct value, skip this step.
- Otherwise, add or update the `base` field inside `defineConfig({...})` to `base: '/REPO_NAME/'`.

Inform the user that this change is required for assets to load correctly on GitHub Pages.

### 7. Build the project

Run `npm run build`. The output goes to `build/` per project config.

If the build fails, print the error and stop. Do not push broken code.

### 8. Deploy via GitHub Pages (gh-pages branch)

GitHub Pages can be served from a dedicated `gh-pages` branch. Use the following approach:

```bash
# Stage all project files (source + build output) and push to main first
git add -A
git commit -m "Deploy to GitHub Pages" || true   # ok if nothing to commit

# Push source to main
git remote set-url origin https://github.com/USERNAME/REPO_NAME.git || \
  git remote add origin https://github.com/USERNAME/REPO_NAME.git
git push -u origin main

# Push only the build/ folder to the gh-pages branch
git subtree push --prefix build origin gh-pages
```

If `git subtree push` fails because the branch already has history, use force:
```bash
git push origin `git subtree split --prefix build main`:gh-pages --force
```

### 9. Enable GitHub Pages on the gh-pages branch

Run:
```bash
gh api repos/USERNAME/REPO_NAME/pages \
  --method POST \
  --field source[branch]=gh-pages \
  --field source[path]=/ \
  2>/dev/null || \
gh api repos/USERNAME/REPO_NAME/pages \
  --method PUT \
  --field source[branch]=gh-pages \
  --field source[path]=/
```

(POST creates it; PUT updates it if it already exists — try POST first.)

### 10. Return the live URL

Print the following to the user:

```
GitHub repository : https://github.com/USERNAME/REPO_NAME
GitHub Pages URL  : https://USERNAME.github.io/REPO_NAME/
```

Note: GitHub Pages can take 1–3 minutes to go live after the first deploy. If the page returns 404 initially, wait a moment and refresh.

## Error handling

- **Build errors** — show the exact error output and stop. Do not push.
- **Auth errors** — remind the user to run `! gh auth login` interactively.
- **Push rejected** — show the git error; suggest pulling first or checking branch protection rules.
- **Pages API 409 Conflict** — Pages already configured; switch to PUT (the script above handles this automatically).
- **`gh` not installed** — instruct the user: `brew install gh` (macOS) or visit https://cli.github.com.
