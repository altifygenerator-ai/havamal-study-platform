Replace these two files in the project:

components/account-manager.tsx
components/account-utility.tsx

The fix aliases the configured Supabase client after the null guard so TypeScript preserves the non-null type inside nested async callbacks.

Then run:
  npm run typecheck
  git add components/account-manager.tsx components/account-utility.tsx
  git commit -m "Fix nullable Supabase client in account components"
  git push origin main
