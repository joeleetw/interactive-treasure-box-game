Deploy the current project to Vercel production and return the live URL.

Steps:
1. Run `npm run build` in the project root. If it fails, show the error and stop.
2. Run `vercel deploy --prod` to push to production. The CLI handles auth and project linking via the `.vercel/project.json` file already present in this repo.
3. Parse the output for the production URL (the line starting with `▲ Aliased` or the `url` field in the JSON block).
4. Print the live URL clearly so the user can open it in a browser.
5. If deployment fails, print the error message and the Vercel inspect URL for debugging.
