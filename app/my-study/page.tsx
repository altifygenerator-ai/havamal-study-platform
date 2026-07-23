import { MyStudyDashboard } from "@/components/my-study-dashboard";

export const metadata = { title: "My saved work" };

export default function Page() {
  return (
    <div className="page-shell">
      <header className="page-heading">
        <div>
          <div className="section-kicker">Private reader folio</div>
          <h1>My saved work</h1>
        </div>
        <p>
          Find every bookmarked passage, private note, personal study guide, and saved quote design connected to your account.
        </p>
      </header>
      <MyStudyDashboard />
    </div>
  );
}
