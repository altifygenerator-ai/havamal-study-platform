import { AuthPanel } from "@/components/auth-panel";
import { AccountManager } from "@/components/account-manager";
import { createMetadata } from "@/lib/seo";
export const metadata = createMetadata({
  title: "Sign In or Create an Account",
  description: "Sign in to save Hávamál bookmarks, private notes, personal study guides, and quote designs.",
  path: "/account",
  index: false,
});



export default function Page() {
  return (
    <div className="narrow-shell account-page">
      <header className="page-heading">
        <div>
          <div className="section-kicker">Your account</div>
          <h1>Sign in or create an account</h1>
        </div>
        <p>Save passages, notes, study guides, and quote cards in one place.</p>
      </header>

      <AuthPanel />
      <AccountManager />
    </div>
  );
}
