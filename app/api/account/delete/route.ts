import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
export async function POST(){const db=await createSupabaseServerClient();if(!db)return NextResponse.json({error:"Supabase is not configured."},{status:503});const{data:{user}}=await db.auth.getUser();if(!user)return NextResponse.json({error:"Sign in to delete the account."},{status:401});const{error}=await db.rpc("delete_own_account");if(error)return NextResponse.json({error:error.message},{status:400});return NextResponse.json({deleted:true})}
