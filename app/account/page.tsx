import { AuthPanel } from "@/components/auth-panel";
import { AccountManager } from "@/components/account-manager";

export const metadata = { title: "Account" };

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
