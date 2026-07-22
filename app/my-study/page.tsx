import { MyStudyDashboard } from "@/components/my-study-dashboard";
export const metadata={title:"My study"};
export default function Page(){return <div className="page-shell"><header className="page-heading"><h1>My study</h1><p>Create private, readable-slug study guides and continue the same work across devices.</p></header><MyStudyDashboard/></div>}
