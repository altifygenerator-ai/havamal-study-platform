# Deployment checklist

- Apply the Supabase migration.
- Configure Auth Site URL and redirects.
- Seed categories/themes before importing source passages.
- Validate and import reviewed sources.
- Assign the first admin directly in SQL.
- Set commercial mode explicitly.
- Run source tests and the production build.
- Check mobile widths, keyboard navigation, focus, quote export, account verification, reset, posting, thread locks, correction submission, and administrator redirects.
- Replace privacy and terms drafts with deployment-specific legal details.
- Confirm no service-role key appears in browser bundles or Vercel public variables.
