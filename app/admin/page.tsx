import Link from "next/link";
import { redirect } from "next/navigation";
import { adminSections } from "@/lib/admin";
import { getAdminAccess } from "@/lib/auth";
export const metadata={title:"Administration"};
export default async function Page(){const access=await getAdminAccess();if(access.configured&&!access.allowed)redirect("/account");return <div className="page-shell"><header className="page-heading"><h1>Administration</h1><p>This protected workspace is for source review, alignment, licensing, moderation, corrections, and audit history.</p></header>{!access.configured&&<section className="notice"><strong>Setup mode.</strong> Supabase is not connected, so no administrative data or write controls are available. After setup, this route requires an administrator role.</section>}<div className="card-list">{adminSections.map(x=><article className="flat-card" key={x.slug}><h2>{x.title}</h2><p>{x.description}</p><Link href={`/admin/${x.slug}`}>Open workspace</Link></article>)}</div></div>}
