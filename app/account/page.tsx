import { AuthPanel } from "@/components/auth-panel";
import { AccountManager } from "@/components/account-manager";

export const metadata = { title: "Account" };

export default function Page() {
  return (
    <div className="narrow-shell account-page">
      <header className="page-heading">
        <div>
          <div className="section-kicker">Saved work</div>
          <h1>Account</h1>
        </div>
        <p>
          Reading, searching, comparing, and basic quote-card creation remain
          available without an account.
        </p>
      </header>

      <AuthPanel />
      <AccountManager />

      <p className="notice account-note">
        Accounts are used only for bookmarks, private notes, personal guides,
        saved quote designs, discussion, reports, and profile settings.
      </p>
    </div>
  );
}
