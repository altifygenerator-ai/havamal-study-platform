"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function AccountManager() {
  const db = useMemo(() => createSupabaseBrowserClient(), []);
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!db) return;
    const supabase = db;
    let active = true;

    async function loadUser(user: { id: string; email?: string | null } | null) {
      if (!active) return;
      if (!user) {
        setUserId(null);
        setEmail("");
        return;
      }

      setUserId(user.id);
      setEmail(user.email || "");
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name,bio")
        .eq("id", user.id)
        .maybeSingle();
      if (!active) return;
      setDisplayName(profile?.display_name || "");
      setBio(profile?.bio || "");
    }

    void supabase.auth.getUser().then(({ data }) => loadUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      window.setTimeout(() => void loadUser(session?.user ?? null), 0);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [db]);

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!db || !userId) return;
    const { error } = await db
      .from("profiles")
      .update({ display_name: displayName.trim(), bio: bio.trim() || null })
      .eq("id", userId);
    setMessage(error?.message || "Profile saved.");
  }

  async function signOut() {
    await db?.auth.signOut();
    setUserId(null);
    router.push("/");
    router.refresh();
  }

  async function exportData() {
    const response = await fetch("/api/account/export");
    if (!response.ok) {
      setMessage((await response.json()).error);
      return;
    }
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download =
      response.headers.get("content-disposition")?.match(/filename="([^"]+)"/)?.[1] ||
      "havamal-study-data.json";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function remove() {
    if (!confirm("Delete this account and all private study data? This cannot be undone.")) return;
    const response = await fetch("/api/account/delete", { method: "POST" });
    const result = await response.json();
    if (!response.ok) {
      setMessage(result.error);
      return;
    }
    setUserId(null);
    router.push("/");
    router.refresh();
  }

  if (!userId) return null;

  return (
    <section className="account-manager">
      <div className="account-manager-heading">
        <div>
          <div className="section-kicker">Signed in</div>
          <h2>{displayName || email}</h2>
          {displayName && <p className="muted">{email}</p>}
        </div>
        <Link className="button" href="/my-study">
          View all saved work
        </Link>
      </div>

      <form className="form-stack" onSubmit={save}>
        <label>
          Display name
          <input
            value={displayName}
            maxLength={80}
            onChange={(event) => setDisplayName(event.target.value)}
            required
          />
        </label>
        <label>
          Short bio
          <textarea
            value={bio}
            maxLength={500}
            onChange={(event) => setBio(event.target.value)}
          />
        </label>
        <button className="button">Save profile</button>
      </form>

      <div className="account-actions">
        <button className="button button-secondary" onClick={exportData}>
          Export my data
        </button>
        <button className="button button-secondary" onClick={signOut}>
          Sign out
        </button>
        <button className="danger-button" onClick={remove}>
          Delete account
        </button>
      </div>
      <p aria-live="polite">{message}</p>
    </section>
  );
}
