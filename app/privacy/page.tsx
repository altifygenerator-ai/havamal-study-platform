export const metadata = { title: "Privacy" };

export default function Page() {
  return (
    <article className="narrow-shell prose-page">
      <h1>Privacy</h1>

      <h2>Reading without an account</h2>
      <p>
        You can read, search, compare translations, and make quote cards without creating
        an account.
      </p>

      <h2>Account information</h2>
      <p>
        Creating an account requires an email address. You may also add a display name,
        profile image, and short bio. Passwords and sign-in sessions are handled through
        Supabase authentication.
      </p>

      <h2>Saved work</h2>
      <p>
        Bookmarks, private notes, personal study guides, and saved quote designs are tied to
        your account. Private study material is not shown in reader discussion or on your
        public profile.
      </p>

      <h2>Discussion and moderation</h2>
      <p>
        Posts, replies, and the display name attached to them are public. Reports,
        moderation notes, account restrictions, and related records are visible only to
        authorized moderators and administrators.
      </p>

      <h2>Analytics</h2>
      <p>
        The site uses Vercel Web Analytics and Speed Insights to understand page traffic
        and performance. These services provide aggregated usage and technical information
        rather than advertising profiles.
      </p>

      <h2>Your choices</h2>
      <p>
        Signed-in readers can export their account data or permanently delete their account
        from the account page.
      </p>
    </article>
  );
}
