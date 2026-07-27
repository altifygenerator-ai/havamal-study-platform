import type { Metadata } from "next";
import { notFound,redirect } from "next/navigation";
import { getPassage } from "@/lib/data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { DiscussionThread } from "@/components/discussion-thread";
import { createMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  if (slug.startsWith("passage-")) {
    return createMetadata({ title: "Passage Discussion", description: "Reader discussion attached to a Hávamál passage.", path: `/discuss/thread/${slug}`, index: false });
  }
  const db = await createSupabaseServerClient();
  if (!db) return createMetadata({ title: "Reader Discussion", description: "Reader discussion of the Hávamál.", path: `/discuss/thread/${slug}`, index: false });
  const { data: thread } = await db.from("forum_threads").select("id,title,status").eq("slug", slug).is("canonical_passage_id", null).maybeSingle();
  if (!thread) return createMetadata({ title: "Discussion Not Found", description: "This discussion is not available.", path: `/discuss/thread/${slug}`, index: false });
  const { count } = await db.from("forum_posts").select("id", { count: "exact", head: true }).eq("thread_id", thread.id).eq("status", "published");
  return createMetadata({ title: thread.title, description: `Read the community discussion: ${thread.title}.`, path: `/discuss/thread/${slug}`, index: (count ?? 0) > 0 });
}

export default async function Page({params}:{params:Promise<{slug:string}>}){const{slug}=await params;if(slug.startsWith("passage-")){if(!getPassage(slug))notFound();redirect(`/havamal/stanza/${slug}#reader-discussion-heading`)}const db=await createSupabaseServerClient();if(!db)notFound();const{data:thread}=await db.from("forum_threads").select("title,slug,status,forum_categories(title,slug)").eq("slug",slug).is("canonical_passage_id",null).maybeSingle();if(!thread)notFound();const category=Array.isArray(thread.forum_categories)?thread.forum_categories[0]:thread.forum_categories;return <div className="page-shell"><header className="page-heading"><div><div className="section-kicker">{category?.title||"Reader discussion"}</div><h1>{thread.title}</h1></div><p>Community discussion is reader-contributed and remains separate from source text and reviewed commentary.</p></header>{thread.status==="locked"&&<div className="notice">This thread is locked. Existing posts remain readable.</div>}<DiscussionThread threadSlug={thread.slug}/></div>}
