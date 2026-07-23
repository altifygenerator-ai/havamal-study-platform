"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type AccountState = {
  loading: boolean;
  signedIn: boolean;
  label: string;
};

export function AccountUtility() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [state, setState] = useState<AccountState>({
    loading: Boolean(supabase),
    signedIn: false,
    label: "",
  });

  useEffect(() => {
    if (!supabase) {
      setState({ loading: false, signedIn: false, label: "" });
      return;
    }

    const client = supabase;
    let active = true;

    async function applyUser(user: { id: string; email?: string | null } | null) {
      if (!active) return;
      if (!user) {
        setState({ loading: false, signedIn: false, label: "" });
        return;
      }

      const { data: profile } = await client
        .from("profiles")
        .select("display_name")
        .eq("id", user.id)
        .maybeSingle();

      if (!active) return;
      setState({
        loading: false,
        signedIn: true,
        label: profile?.display_name?.trim() || user.email || "Reader",
      });
    }

    void client.auth.getUser().then(({ data }) => applyUser(data.user));
    const { data: listener } = client.auth.onAuthStateChange((_event, session) => {
      window.setTimeout(() => void applyUser(session?.user ?? null), 0);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [supabase]);

  async function signOut() {
    await supabase?.auth.signOut();
    window.location.assign("/");
  }

  if (state.loading) {
    return <span className="account-utility-status">Checking account…</span>;
  }

  if (!state.signedIn) {
    return (
      <span className="account-utility">
        <Link href="/account">Sign in</Link>
      </span>
    );
  }

  return (
    <span className="account-utility account-utility-signed-in">
      <span className="account-utility-status">
        Signed in as <Link href="/account">{state.label}</Link>
      </span>
      <Link className="saved-work-link" href="/my-study">
        My saved work
      </Link>
      <button type="button" onClick={signOut}>
        Sign out
      </button>
    </span>
  );
}
