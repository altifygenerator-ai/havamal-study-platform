"use client";

import { FormEvent, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function Page() {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (!supabase) {
      setMessage("Connect Supabase to reset passwords.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      setMessage(error?.message || "Password updated.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="narrow-shell">
      <header className="page-heading">
        <div>
          <div className="section-kicker">Account recovery</div>
          <h1>New password</h1>
        </div>
        <p>Use the recovery link from your email before submitting this form.</p>
      </header>

      <section className="auth-panel auth-panel-reset" aria-labelledby="reset-heading">
        <div className="auth-panel-body">
          <header className="auth-panel-heading">
            <span className="auth-folio-mark" aria-hidden="true">III</span>
            <div>
              <h2 id="reset-heading">Choose a new password</h2>
              <p>Use at least eight characters and avoid reusing a password from another account.</p>
            </div>
          </header>

          <form className="auth-form" onSubmit={submit}>
            <label>
              <span>New password</span>
              <input
                type="password"
                minLength={8}
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="At least 8 characters"
                required
              />
            </label>
            <button className="auth-submit" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Please wait…" : "Update password"}
            </button>
            {message && <p className="auth-message" aria-live="polite">{message}</p>}
          </form>
        </div>
      </section>
    </div>
  );
}
