import { MyStudyDashboard } from "@/components/my-study-dashboard";

export const metadata = { title: "My saved work" };

export default function Page() {
  return (
    <div className="page-shell">
      <header className="page-heading">
        <div>
          <div className="section-kicker">Your archive</div>
          <h1>My saved work</h1>
        </div>
        <p>Bookmarks, notes, personal guides, and saved quote cards, all in one place.</p>
      </header>
      <MyStudyDashboard />
    </div>
  );
}
