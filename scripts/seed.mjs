import { readFile } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";
const url=process.env.SUPABASE_URL||process.env.NEXT_PUBLIC_SUPABASE_URL;const key=process.env.SUPABASE_SERVICE_ROLE_KEY;if(!url||!key){console.error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");process.exit(1)}const db=createClient(url,key,{auth:{persistSession:false}});
const themes=JSON.parse(await readFile("data/themes.json","utf8"));const categories=JSON.parse(await readFile("data/forum-categories.json","utf8"));
let r=await db.from("themes").upsert(themes.map(x=>({...x,status:"published"})),{onConflict:"slug"});if(r.error)throw r.error;
r=await db.from("forum_categories").upsert(categories.map((x,i)=>({...x,sort_order:i,status:"published"})),{onConflict:"slug"});if(r.error)throw r.error;
r=await db.from("quote_templates").upsert([{slug:"iron-and-white",title:"Black Iron and Cool White",configuration:{palette:"iron",textFirst:true},approved:true},{slug:"deep-ink",title:"Deep Ink and Mineral Blue",configuration:{palette:"ink",textFirst:true},approved:true},{slug:"archive",title:"Clean Archive Typography",configuration:{palette:"archive",textFirst:true},approved:true}],{onConflict:"slug"});if(r.error)throw r.error;
console.log(`Seeded ${themes.length} themes, ${categories.length} categories, and 3 quote templates.`)
