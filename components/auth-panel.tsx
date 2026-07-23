"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type AuthMode = "signin" | "signup" | "reset";

const modeCopy: Record<AuthMode, { title: string; note: string; action: string }> = {
  signin: {
    title: "Return to your saved work",
    note: "Sign in to open your bookmarks, private notes, study guides, saved quote designs, and discussion account.",
    action: "Sign in",
  },
  signup: {
    title: "Create a reader account",
    note: "An account is only needed for saved work and participation. Reading and comparison remain open to everyone.",
    action: "Create account",
  },
  reset: {
    title: "Recover your account",
    note: "Enter the email address connected to your account and we will send a password-reset link.",
    action: "Send reset link",
  },
};

export function AuthPanel() {
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signedInEmail, setSignedInEmail] = useState<string | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const copy = modeCopy[mode];

  useEffect(() => {
    if (!supabase) {
      setCheckingSession(false);
      return;
    }

    let active = true;
    void supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      setSignedInEmail(data.user?.email ?? null);
      setCheckingSession(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSignedInEmail(session?.user?.email ?? null);
      setCheckingSession(false);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [supabase]);

  function chooseMode(nextMode: AuthMode) {
    setMode(nextMode);
    setMessage("");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (!supabase) {
      setMessage("Connect Supabase to enable accounts.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === "reset") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${location.origin}/account/reset`,
        });
        setMessage(error?.message || "Check your email for the reset link.");
        return;
      }

      const result =
        mode === "signup"
          ? await supabase.auth.signUp({
              email,
              password,
              options: { emailRedirectTo: `${location.origin}/account` },
            })
          : await supabase.auth.signInWithPassword({ email, password });

      if (result.error) {
        setMessage(result.error.message);
        return;
      }

      if (result.data.session) {
        window.location.assign("/my-study");
        return;
      }

      setMessage(
        mode === "signup"
          ? "Check your email to verify the account."
          : "Signed in.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (checkingSession) {
    return <div className="account-session-check">Checking your account…</div>;
  }

  if (signedInEmail) {
    return (
      <section className="signed-in-panel">
        <div>
          <div className="section-kicker">Reader account active</div>
          <h2>You are signed in</h2>
          <p>{signedInEmail}</p>
        </div>
        <Link className="button" href="/my-study">
          Open all saved work
        </Link>
      </section>
    );
  }

  return (
    <section className="auth-panel" aria-labelledby="auth-panel-title">
      <div className="auth-tabs" role="tablist" aria-label="Account options">
        <button
          type="button"
          role="tab"
          aria-selected={mode === "signin"}
          onClick={() => chooseMode("signin")}
        >
          Sign in
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "signup"}
          onClick={() => chooseMode("signup")}
        >
          Create account
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "reset"}
          onClick={() => chooseMode("reset")}
        >
          Reset password
        </button>
      </div>

      <div className="auth-panel-body">
        <header className="auth-panel-heading">
          <span className="auth-folio-mark" aria-hidden="true">
            II
          </span>
          <div>
            <h2 id="auth-panel-title">{copy.title}</h2>
            <p>{copy.note}</p>
          </div>
        </header>

        <form className="auth-form" onSubmit={submit}>
          <label>
            <span>Email address</span>
            <input
              type="email"
              inputMode="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@example.com"
              required
            />
          </label>

          {mode !== "reset" && (
            <label>
              <span>Password</span>
              <input
                type="password"
                minLength={8}
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="At least 8 characters"
                required
              />
            </label>
          )}

          <button className="auth-submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Please wait…" : copy.action}
          </button>

          {message && (
            <p className="auth-message" aria-live="polite">
              {message}
            </p>
          )}
        </form>
      </div>
    </section>
  );
}
